import { createFileRoute } from '@tanstack/react-router'
import {
  Flex,
  Link as ChakraLink,
  Table,
  Tbody,
  Tr,
  Td,
  Thead,
  Th,
  Input,
  Select,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'
import { FormEventHandler, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'

import { pb } from '@/services/pb'
import {
  Collections,
  InvestigationsInvStatusOptions,
  InvestigationsRecord,
  InvestigationsResponse,
} from '@/services/pocketbase-types'
import { queryClient } from '@/services/queryClient'
import { throttle } from '@/services/throttle'

export const Route = createFileRoute('/investigations')({
  component: InvestigationsPage,
})

function InvestigationsPage() {
  const bg = useColorModeValue('white', 'gray.700')
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedDev, setSelectedDev] = useState('')
  const { mutate: updateInvestigation, isPending: isUpdating } = useMutation({
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [Collections.Investigations, 'all'],
      })
    },
    mutationFn(params: { id: string; payload: Partial<InvestigationsRecord> }) {
      return pb
        .collection(Collections.Investigations)
        .update<InvestigationsRecord>(params.id, params.payload)
    },
  })
  const {
    data: investigations = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [Collections.Investigations, 'all'],
    queryFn: () =>
      pb
        .collection(Collections.Investigations)
        .getFullList<InvestigationsResponse>(),
  })

  useEffect(() => {
    const invalidate = throttle(() => {
      queryClient.invalidateQueries({
        queryKey: [Collections.Investigations, 'all'],
      })
    }, 5000)

    pb.collection(Collections.Investigations).subscribe('*', () => {
      invalidate()
    })

    return () => {
      pb.collection(Collections.Investigations).unsubscribe('*')
    }
  }, [])

  const groupByInvestigations = useMemo(() => {
    const by: Record<string, InvestigationsResponse[]> = {}
    for (const inv of investigations) {
      if (!by[inv.name]) {
        by[inv.name] = []
      }
      by[inv.name].push(inv)
      by[inv.name].sort((a, b) => b.date.localeCompare(a.date))
    }
    return by
  }, [investigations])

  const names = Object.keys(groupByInvestigations) as Array<
    keyof typeof groupByInvestigations
  >

  const onSearch: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    const form = new FormData(event.target as HTMLFormElement)
    const search = form.get('search')?.toString() || ''
    setQuery(search)
  }

  const onDone = (id: string) => {
    updateInvestigation({
      id,
      payload: { inv_status: InvestigationsInvStatusOptions.DONE },
    })
  }

  if (isLoading || isFetching) {
    return <Flex>loading...</Flex>
  }

  const devs = Array.from(new Set(investigations.map((i) => i.owner)))

  return (
    <Flex flexDir="column" gap={isOpen ? 5 : 0}>
      <form onSubmit={onSearch}>
        <Flex gap={4} marginBottom="50px">
          <Button colorScheme="blue" onClick={() => setIsOpen(!isOpen)}>
            toggle
          </Button>
          <Select
            defaultValue={selectedDev}
            name="dev"
            bg={bg}
            maxWidth="400px"
            onChange={(e) => setSelectedDev(e.target.value)}
          >
            <option value="">-</option>
            {devs.map((dev) => (
              <option>{dev}</option>
            ))}
          </Select>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            name="search"
            bg={bg}
            placeholder="search"
          />
        </Flex>
      </form>
      <Flex mb="20px">
        filter: (dev: '{selectedDev}', query:'{query}') | results :
        {
          names.filter((name) => {
            return (
              !groupByInvestigations[name]
                .map((x) => x.inv_status)
                .includes(InvestigationsInvStatusOptions.DONE) &&
              groupByInvestigations[name]
                .map((x) => x.owner)
                .filter((x) => x.includes(selectedDev)).length > 0 &&
              (name.toLowerCase().includes(query) || query === '')
            )
          }).length
        }
      </Flex>

      {names
        .filter((name) => {
          return (
            !groupByInvestigations[name]
              .map((x) => x.inv_status)
              .includes(InvestigationsInvStatusOptions.DONE) &&
            groupByInvestigations[name]
              .map((x) => x.owner)
              .filter((x) => x.includes(selectedDev)).length > 0 &&
            (name.toLowerCase().includes(query) || query === '')
          )
        })
        .map((name) => {
          return (
            <Flex
              flexDir="column"
              boxShadow="md"
              rounded="md"
              borderTop={isOpen ? 'unset' : '1px solid #ccc'}
            >
              <Flex bg={bg} fontWeight="bold" fontSize="x-large" px={2} py={1}>
                {name}
              </Flex>
              {isOpen && (
                <Table bg={bg} rounded="md">
                  <Thead>
                    <Tr>
                      <Th whiteSpace="nowrap">key</Th>
                      <Th>sprint</Th>
                      <Th>inv</Th>
                      <Th>status</Th>
                      <Th>points</Th>
                      <Th>owner</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {groupByInvestigations[name].map((ticket) => (
                      <Tr>
                        <Td whiteSpace="nowrap">
                          <ChakraLink
                            target="_blank"
                            href={`https://devopsjira.deutsche-boerse.com/browse/${ticket.key}`}
                          >
                            {ticket.key}
                          </ChakraLink>
                        </Td>
                        <Td>{ticket.sprint}</Td>
                        <Td>{ticket.inv_status}</Td>
                        <Td>{ticket.status}</Td>
                        <Td>{ticket.points}</Td>
                        <Td>{ticket.owner}</Td>
                        <Td title={ticket.summary}>
                          {ticket.summary.substring(0, 80)}
                        </Td>
                        {pb.authStore.model?.isAdmin && (
                          <Td>
                            <Button
                              isLoading={isUpdating}
                              colorScheme="red"
                              onClick={() => onDone(ticket.id)}
                            >
                              DONE
                            </Button>
                          </Td>
                        )}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Flex>
          )
        })}
    </Flex>
  )
}

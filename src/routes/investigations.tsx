import {
  Flex,
  Text,
  Link as ChakraLink,
  Table,
  Tbody,
  Tr,
  Td,
  Thead,
  Th,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'

import GenericTable from '@/components/GenericTable'
import { pb } from '@/services/pb'
import {
  Collections,
  InvestigationsInvStatusOptions,
  InvestigationsResponse,
} from '@/services/pocketbase-types'

export const Route = createFileRoute('/investigations')({
  component: InvestigationsPage,
})

function InvestigationsPage() {
  const { data: investigations = [] } = useQuery({
    queryKey: [Collections.Investigations, 'all'],
    queryFn: () =>
      pb
        .collection(Collections.Investigations)
        .getFullList<InvestigationsResponse>(),
  })

  const groupByInvestigations = useMemo(() => {
    const by: Record<string, InvestigationsResponse[]> = {}
    for (let inv of investigations) {
      if (!by[inv.name]) {
        by[inv.name] = []
      }
      by[inv.name].push(inv)
      by[inv.name].sort((a, b) => b.date.localeCompare(a.date))
    }
    return by

    // const get = <T,>(arr: T[], fn: (row: T) => T[keyof T]) => {
    //   return arr.map(fn)
    // }

    // const get_plus = <T,>(tickets: T[], field: keyof T) => {
    //   return (
    //     <Flex flexShrink={0} flexDir="column">
    //       {get(tickets, (x) => x[field]).map((x) => (
    //         // @ts-ignore
    //         <Flex>{x}</Flex>
    //       ))}
    //     </Flex>
    //   )
    // }
    //

    // return by

    // return Object.keys(by).map((name) => {
    //   const tickets = by[name]
    //   tickets.sort((a, b) => b.sprint.localeCompare(a.sprint))
    //
    //   // const statuses = get_plus(tickets, 'inv_status')
    //   // const keys = get(tickets, (x) => x.key) as Array<string>
    //   // const status = get_plus(tickets, 'status')
    //   // const sprint = get_plus(tickets, 'sprint')
    //   // const points = get(tickets, (x) => x.points).reduce(
    //   //   (sum, points) => Number(sum) + Number(points),
    //   //   0
    //   // )
    //
    //   return {
    //     name,
    //     tickets: (
    //       <table>
    //         <tbody>
    //           {tickets.map((ticket) => (
    //             <tr>
    //               <td>{ticket.key}</td>
    //               <td>{ticket.inv_status}</td>
    //               <td>{ticket.points}</td>
    //               <td>{ticket.status}</td>
    //             </tr>
    //           ))}
    //         </tbody>
    //       </table>
    //     ),
    //     // statuses,
    //     // status,
    //     // sprint,
    //     // owners: get(tickets, (x) => x.owner).join(', '),
    //     // points,
    //     // keys: keys.map((key) => (
    //     //   <ChakraLink
    //     //     target="_blank"
    //     //     href={`https://devopsjira.deutsche-boerse.com/browse/${key}`}
    //     //   >
    //     //     <Text color="blue.500" fontWeight="bold">
    //     //       {key}
    //     //     </Text>
    //     //   </ChakraLink>
    //     // )),
    //   }
    // })
  }, [investigations])

  // const notFinished = groupByInvestigations
  //   .filter((x) => x.statuses !== 'DONE')
  //   .filter((x) => x.owners.includes('Pierre'))
  // notFinished.sort((a, b) => a.owners.localeCompare(b.owners))
  //
  const names = Object.keys(groupByInvestigations) as Array<
    keyof typeof groupByInvestigations
  >

  return (
    <Flex flexDir="column" gap={5} paddingBottom="30px">
      <Text>Investigations</Text>
      {names
        .filter((name) => {
          return (
            !groupByInvestigations[name]
              .map((x) => x.inv_status)
              .includes(InvestigationsInvStatusOptions.DONE) &&
            groupByInvestigations[name]
              .map((x) => x.owner)
              .filter((x) => x.includes('Olivier')).length > 0
          )
        })
        .map((name) => {
          return (
            <Flex flexDir="column" boxShadow="md">
              <Flex bg="gray.100" fontWeight="bold" fontSize="x-large">
                {name}
              </Flex>
              <Table>
                <Thead>
                  <Tr>
                    <Th>key</Th>
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
                      <Td>{ticket.key}</Td>
                      <Td>{ticket.sprint}</Td>
                      <Td>{ticket.inv_status}</Td>
                      <Td>{ticket.status}</Td>
                      <Td>{ticket.points}</Td>
                      <Td>{ticket.owner}</Td>
                      <Td title={ticket.summary}>
                        {ticket.summary.substring(0, 80)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Flex>
          )
        })}
      {/* <GenericTable rows={groupByInvestigations} /> */}
    </Flex>
  )
}

import { pb } from '@/services/pb'
import { Collections, SprintDatesViewResponse, SprintDevsViewResponse, TicketsResponse } from '@/services/pocketbase-types'
import { Button, Flex, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import z from 'zod'

export const Route = createFileRoute('/$sprintId/daily')({
  component: Daily,
  validateSearch: z.object({
    selectedDate: z.string().nullish(),
    selectedDev: z.string().nullish(),
  })
})

function Daily() {
  const { sprintId } = Route.useParams()
  const { selectedDate, selectedDev } = Route.useSearch()

  const { data: dates = [] } = useQuery({
    queryKey: [Collections.SprintDatesView, 'get-by-sprint', sprintId],
    queryFn: () => pb.collection(Collections.SprintDatesView).getFullList<SprintDatesViewResponse>({
      filter: `sprint = '${sprintId}'`
    })
  })

  const previous_day = useMemo(() => {
    const index = dates.map(date => date.utc_date.split(' ')[0])
      .findIndex((date) => date === selectedDate)

    return index === 0 ? null : dates[index - 1]
  }, [dates, selectedDate])

  const filter = `sprint = '${sprintId}' && date = '${selectedDate}' && status != 'To Do'`

  const { data: tickets = [] } = useQuery({
    queryKey: [Collections.Tickets, 'get-by-sprint', sprintId, selectedDate, selectedDev],
    queryFn: () => pb.collection(Collections.Tickets).getFullList<TicketsResponse>({
      filter: selectedDev ? filter + ` && owner = '${selectedDev}'` : filter,
      sort: 'status',
    }),
    enabled: !!selectedDate,
  })

  const old_filter = `sprint = '${sprintId}' && date = '${previous_day}' && status != 'Done' && status != 'In Test'`
  const { data: old_tickets = [] } = useQuery({
    queryKey: [Collections.Tickets, 'old', 'get-by-sprint', sprintId, previous_day, selectedDev],
    queryFn: () => pb.collection(Collections.Tickets).getFullList<TicketsResponse>({
      filter: selectedDev ? old_filter + ` && owner = '${selectedDev}'` : old_filter,
      sort: 'status',
    }),
    enabled: !!previous_day,
  })

  return (
    <Flex flexDir="column" padding="5" h="100vdh" overflow="auto" gap="2">
      <Flex gap="2">
        <Link to="/$sprintId/daily" params={{ sprintId }}>
          <Button size="sm">reset</Button>
        </Link>
        <DateBtns />
      </Flex>
      <Flex gap="2">
        <DevsBtns />
      </Flex>

      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Ticket</Th>
            <Th>Owner</Th>
            <Th>Summary</Th>
            <Th>Status</Th>
            <Th>Points</Th>
            <Th>Warning</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tickets.sort(SortFn).map(ticket => (
            <Tr key={ticket.key}>
              <Td>{ticket.key}</Td>
              <Td>{ticket.owner}</Td>
              <Td>{ticket.summary}</Td>
              <Td>{ticket.status}</Td>
              <Td>{ticket.points}</Td>
              <Td>{old_tickets.find(old_ticket => old_ticket.key === ticket.key)?.status}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  )
}

function SortFn(ta: TicketsResponse, tb: TicketsResponse): number {
  const byStatus: Record<string, number> = {
    'To Do': 0,
    'To Develop': 1,
    'In Progress': 2,
    'In Review': 3,
    'In Test': 4,
    'Done': 5,
  }

  const statusa = byStatus[ta.status]
  const statusb = byStatus[tb.status]

  return statusb - statusa
}

function DateBtns() {
  const { sprintId } = Route.useParams()
  const { selectedDate, selectedDev } = Route.useSearch()

  const { data: dates = [] } = useQuery({
    queryKey: [Collections.SprintDatesView, 'get-by-sprint', sprintId],
    queryFn: () => pb.collection(Collections.SprintDatesView).getFullList<SprintDatesViewResponse>({
      filter: `sprint = '${sprintId}'`
    })
  })

  return dates.map(date => {
    const _selectedDate = date.utc_date.split(' ')[0]
    return (
      <Link
        key={date.id}
        to="/$sprintId/daily"
        params={{ sprintId }}
        search={{ selectedDate: _selectedDate, selectedDev }}>
        <Button isActive={selectedDate === _selectedDate} size="sm">{_selectedDate}</Button>
      </Link>
    )
  })

}

function DevsBtns() {
  const { sprintId } = Route.useParams()
  const { selectedDate, selectedDev } = Route.useSearch()

  const { data: devs = [] } = useQuery({
    queryKey: [Collections.SprintDevsView, 'get-by-sprint', sprintId],
    queryFn: () => pb.collection(Collections.SprintDevsView).getFullList<SprintDevsViewResponse>({
      filter: `sprint = '${sprintId}'`
    }),
  })

  return devs.map(dev => {
    return (
      <Link
        key={dev.dev}
        to="/$sprintId/daily"
        params={{ sprintId }}
        search={{ selectedDate, selectedDev: dev.dev }}
      >
        <Button size="sm" isActive={selectedDev === dev.dev}>{dev.dev}</Button>
      </Link>
    )
  })
}

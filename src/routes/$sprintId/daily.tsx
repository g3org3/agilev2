import { pb } from '@/services/pb'
import { Collections, LatestSprintPointsViewResponse, SprintDatesViewResponse, SprintDevsViewResponse, TicketsResponse } from '@/services/pocketbase-types'
import { Avatar, Button, Flex, Spacer, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import z from 'zod'

export const Route = createFileRoute('/$sprintId/daily')({
  component: Daily,
  validateSearch: z.object({
    selectedDate: z.string().nullish(),
    selectedDev: z.string().nullish(),
    view: z.enum(['table', 'trello']).nullish(),
  })
})

function Daily() {
  const { sprintId } = Route.useParams()
  const { selectedDate, selectedDev, view = 'table' } = Route.useSearch()

  const { data: dates = [] } = useQuery({
    queryKey: [Collections.SprintDatesView, 'get-by-sprint', sprintId],
    queryFn: () => pb.collection(Collections.SprintDatesView).getFullList<SprintDatesViewResponse>({
      filter: `sprint = '${sprintId}'`
    })
  })

  const previous_day = useMemo(() => {
    const index = dates.map(date => date.utc_date.split(' ')[0])
      .findIndex((date) => date === selectedDate)

    return index === 0 || index === -1 ? null : dates[index - 1].utc_date.split(' ')[0]
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

  const old_filter = `sprint = '${sprintId}' && date = '${previous_day}' && status != 'To Do'`
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
        <Link to="/$sprintId/daily" params={{ sprintId }} search={{ selectedDev, selectedDate, view: view === 'table' ? 'trello' : 'table' }}>
          <Button size="sm">change to {view === 'table' ? 'trello' : 'table'}</Button>
        </Link>
        <Link to="/$sprintId/daily" params={{ sprintId }}>
          <Button size="sm">reset</Button>
        </Link>
        <DateBtns />
      </Flex>
      <Flex gap="2">
        <DevsBtns />
      </Flex>
      <DaySummary />
      {view === 'table' ? <TableTickets tickets={tickets} old_tickets={old_tickets} /> : null}
      {view === 'trello' ? <TrelloTickets tickets={tickets} old_tickets={old_tickets} /> : null}
    </Flex>
  )
}

function TrelloTickets({ tickets, old_tickets }: { tickets: TicketsResponse[], old_tickets: TicketsResponse[] }) {
  return (
    <Flex gap="4">
      <TrelloColumn tickets={tickets} old_tickets={old_tickets} status='To Develop' label='Daily' />
      <TrelloColumn tickets={tickets} old_tickets={old_tickets} status='In Progress' label='Doing' />
      <TrelloColumn tickets={tickets} old_tickets={old_tickets} status='In Review' label='Code Review' />
      <TrelloColumn tickets={tickets} old_tickets={old_tickets} status='In Test' label='To Validate' />
      <TrelloColumn tickets={tickets} old_tickets={old_tickets} status='Done' label='Done' />
    </Flex>
  )
}

function TrelloColumn({ tickets, status, label, old_tickets }: { tickets: TicketsResponse[], status: string, label: string, old_tickets: TicketsResponse[] }) {
  const column_tickets = tickets.filter(ticket => ticket.status === status)
  return (
    <Flex flexDir="column" boxShadow="md" width="20%">
      <Flex px="4" py="2" background="gray.200" fontWeight="bold" alignItems="center">
        <Flex>{label}</Flex>
        <Spacer />
        <Flex
          h="36px"
          w="36px"
          background="white"
          fontFamily="monospace"
          rounded="full"
          alignItems="center"
          justifyContent="center">
          {column_tickets.reduce((sum, ticket) => sum + (ticket.points || 0), 0)}
        </Flex>
      </Flex>
      <Flex flexDir="column" p="3" gap="3">
        {column_tickets.map(ticket => {
          const warning = ['Done'].includes(ticket.status)
            ? null
            : old_tickets.find(old_ticket => old_ticket.key === ticket.key)?.status

          let color = !warning ? 'gray.100' : 'red.300'
          if (warning != 'In Test' && ticket.status === 'In Test') {
            color = 'yellow.300'
          }
          if (warning == 'In Test' && ticket.status === 'In Test') {
            color = 'orange.300'
          }
          if (ticket.status === 'Done') {
            color = 'green.300'
          }
          return (
            <Flex title={ticket.summary} key={ticket.key} p="2" borderLeft="7px solid" boxShadow="md" borderColor={color} gap="3" alignItems="center" fontFamily="monospace" fontWeight="bold">
              <Avatar size="sm" name={ticket.owner.replace(' EXT', '')} />
              <Flex>{ticket.key}</Flex>
              <Spacer />
              <Flex background="gray.500" color="white" rounded="full" justifyContent="center" alignItems="center" w="30px" h="30px">{ticket.points}</Flex>
            </Flex>
          )
        })}
      </Flex>
    </Flex>
  )
}

function TableTickets({ tickets, old_tickets }: { tickets: TicketsResponse[], old_tickets: TicketsResponse[] }) {
  return (
    <Table size="sm" boxShadow="md">
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
        {tickets.sort(SortFn).map(ticket => {
          const warning = ['Done'].includes(ticket.status)
            ? null
            : old_tickets.find(old_ticket => old_ticket.key === ticket.key)?.status

          let color = !warning ? undefined : 'red.100'
          if (warning != 'In Test' && ticket.status === 'In Test') {
            color = 'yellow.100'
          }
          if (warning == 'In Test' && ticket.status === 'In Test') {
            color = 'orange.100'
          }
          if (ticket.status === 'Done') {
            color = 'green.100'
          }

          return (
            <Tr background={color} key={ticket.key}>
              <Td>{ticket.key}</Td>
              <Td>{ticket.owner}</Td>
              <Td>{ticket.summary.substring(0, 170)}...</Td>
              <Td>{ticket.status}</Td>
              <Td>{ticket.points}</Td>
              <Td>{warning}</Td>
            </Tr>
          )
        })}
      </Tbody>
    </Table>
  )
}

function DaySummary() {
  const { sprintId } = Route.useParams()
  const { selectedDate } = Route.useSearch()

  const { data: summary } = useQuery({
    queryKey: [''],
    queryFn: () => pb.collection(Collections.LatestSprintPointsView).getOne<LatestSprintPointsViewResponse>(
      `${sprintId}-${selectedDate}`
    ),
    enabled: !!selectedDate,
  })

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Done</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>{summary?.tbd_points}</Td>
        </Tr>
      </Tbody>
    </Table>
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
  const { selectedDate, selectedDev, view } = Route.useSearch()

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
        search={{ selectedDate: _selectedDate, selectedDev, view }}>
        <Button isActive={selectedDate === _selectedDate} size="sm">{_selectedDate}</Button>
      </Link>
    )
  })

}

function DevsBtns() {
  const { sprintId } = Route.useParams()
  const { selectedDate, selectedDev, view } = Route.useSearch()

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
        search={{ selectedDate, selectedDev: dev.dev, view }}
      >
        <Button size="sm" isActive={selectedDev === dev.dev}>{dev.dev}</Button>
      </Link>
    )
  })
}

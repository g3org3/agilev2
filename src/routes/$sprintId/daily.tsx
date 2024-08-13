import { getNextDate } from '@/services/dates'
import { pb } from '@/services/pb'
import { Collections, SprintDatesViewResponse, SprintDevsViewResponse, SprintsViewResponse, StaffingResponse, TicketsResponse } from '@/services/pocketbase-types'
import { Link as ChakraLink, Avatar, Button, Flex, Heading, Spacer, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
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
  const navigate = Route.useNavigate()

  const { data: dates = [] } = useQuery({
    queryKey: [Collections.SprintDatesView, 'get-by-sprint', sprintId],
    queryFn: () => pb.collection(Collections.SprintDatesView).getFullList<SprintDatesViewResponse>({
      filter: `sprint = '${sprintId}'`
    })
  })

  // to set the date if not present in the url
  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      navigate({
        to: '/$sprintId/daily',
        params: { sprintId },
        search: { selectedDate: dates[0].date },
      })
    }
  }, [selectedDate, dates])

  const previous_day = useMemo(() => {
    const index = dates.map(date => date.date)
      .findIndex((date) => date === selectedDate)

    return index === 0 || index === -1 ? null : dates[index - 1].date
  }, [dates, selectedDate])

  const filter = `sprint = '${sprintId}' && date = '${selectedDate}' && status != 'To Do'`

  const { data: tickets = [], isFetching: isFetchingTickets } = useQuery({
    queryKey: [Collections.Tickets, 'get-by-sprint', sprintId, selectedDate, selectedDev],
    queryFn: () => pb.collection(Collections.Tickets).getFullList<TicketsResponse<string[], string[]>>({
      filter: selectedDev ? filter + ` && owner = '${selectedDev}'` : filter,
      sort: 'status',
    }),
    enabled: !!selectedDate,
  })

  const old_filter = `sprint = '${sprintId}' && date = '${previous_day}' && status != 'To Do'`
  const { data: old_tickets = [], isFetching: isFetchingOldTickets } = useQuery({
    queryKey: [Collections.Tickets, 'old', 'get-by-sprint', sprintId, previous_day, selectedDev],
    queryFn: () => pb.collection(Collections.Tickets).getFullList<TicketsResponse<string[], string[]>>({
      filter: selectedDev ? old_filter + ` && owner = '${selectedDev}'` : old_filter,
      sort: 'status',
    }),
    enabled: !!previous_day,
  })

  const { data: sprint } = useQuery({
    queryKey: [Collections.SprintsView, 'get-one', sprintId],
    queryFn: () => pb.collection(Collections.SprintsView).getOne<SprintsViewResponse<number, number, number, number>>(sprintId)
  })

  const tickets_or_cache = tickets.length > 0 ? tickets : old_tickets

  return (
    <Flex flexDir="column" padding="5" h="100vh" overflow="auto" gap="5" background="whitesmoke">
      <Heading>
        {sprintId} - {sprint?.done_points}/{sprint?.tbd_points} points
      </Heading>
      <Flex gap="2" alignItems="center">
        <DaySummary tickets={tickets_or_cache} />
        <Flex flexDir="column" gap="4">
          <Flex gap="2">
            <Link to="/">
              <Button size="sm">back</Button>
            </Link>
            <Link to="/$sprintId/daily" params={{ sprintId }} search={{ selectedDev, selectedDate, view: view === 'table' ? 'trello' : 'table' }}>
              <Button variant="outline" colorScheme="purple" size="sm">change to {view === 'table' ? 'trello' : 'table'}</Button>
            </Link>
          </Flex>
          <Flex gap="2">
            <DateBtns />
          </Flex>
          <Flex gap="2">
            <DevsBtns />
          </Flex>
        </Flex>
      </Flex>
      <Flex flexDir="column" flex="1" overflow="auto" py="4">
        {isFetchingTickets || isFetchingOldTickets && <Flex animation="pu" background="gray.100" w="100%" h="100%" position="absolute" zIndex="1" opacity="0.6"></Flex>}
        {view === 'table' ? <TableTickets tickets={tickets_or_cache} old_tickets={old_tickets} /> : null}
        {view === 'trello' ? <TrelloTickets tickets={tickets_or_cache} old_tickets={old_tickets} /> : null}
      </Flex>
    </Flex>
  )
}

function TrelloTickets({ tickets, old_tickets }: { tickets: TicketsResponse[], old_tickets: TicketsResponse[] }) {
  return (
    <Flex gap="4" flex="1" py="5" overflow="auto">
      <TrelloColumn tickets={tickets} old_tickets={old_tickets} status='To Develop' label='Daily' />
      <TrelloColumn tickets={tickets} old_tickets={old_tickets} status='In Progress' label='Doing' />
      <TrelloColumn tickets={tickets} old_tickets={old_tickets} status='In Review' label='Code Review' />
      <TrelloColumn tickets={tickets} old_tickets={old_tickets} status='In Test' label='To Validate' />
      <TrelloColumn tickets={tickets.filter(filterIfWasDoneYesterday(old_tickets))} old_tickets={old_tickets} status='Done' label='Done' />
    </Flex>
  )
}

function TrelloColumn({ tickets, status, label, old_tickets }: { tickets: TicketsResponse[], status: string, label: string, old_tickets: TicketsResponse[] }) {
  const column_tickets = tickets.filter(ticket => ticket.status === status)
  return (
    <Flex flexDir="column" boxShadow="md" width="20%" flex="1" overflow="auto" background="white" rounded="md">
      <Flex px="4" py="2" background="blue.600" fontWeight="bold" alignItems="center">
        <Flex color="white">{label}</Flex>
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
      <Flex flexDir="column" p="3" gap="3" flex="1" overflow="auto">
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
              <Flex>
                <ChakraLink target="_blank" href={"https://devopsjira.deutsche-boerse.com/browse/" + ticket.key}>
                  {ticket.key}
                </ChakraLink>
              </Flex>
              <Spacer />
              <Flex background="gray.500" color="white" rounded="full" justifyContent="center" alignItems="center" w="30px" h="30px">{ticket.points}</Flex>
            </Flex>
          )
        })}
      </Flex>
    </Flex>
  )
}

function TableTickets({ tickets, old_tickets }: { tickets: TicketsResponse<string[], string[]>[], old_tickets: TicketsResponse[] }) {
  return (
    <Table size="sm" boxShadow="md" background="white" rounded="lg">
      <Thead>
        <Tr background="blue.500">
          <Th color="white" p="2">Ticket</Th>
          <Th color="white">Owner</Th>
          <Th color="white">Summary</Th>
          <Th color="white">Labels</Th>
          <Th color="white">Epic</Th>
          <Th color="white">BlockedBy</Th>
          <Th color="white">Status</Th>
          <Th color="white">Points</Th>
          <Th color="white">Warning</Th>
        </Tr>
      </Thead>
      <Tbody>
        {tickets.sort(SortFn).filter(filterIfWasDoneYesterday(old_tickets)).map(ticket => {
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
              <Td>
                <ChakraLink
                  target="_blank"
                  href={"https://devopsjira.deutsche-boerse.com/browse/" + ticket.key}
                >
                  {ticket.key}
                </ChakraLink>
              </Td>
              <Td><Avatar title={ticket.owner} size="sm" name={ticket.owner.replace(' EXT', '')} /></Td>
              <Td title={ticket.summary}>{ticket.summary.substring(0, 110)}...</Td>
              <Td>{ticket.labels?.join(', ')}</Td>
              <Td>
                <ChakraLink
                  target="_blank"
                  href={"https://devopsjira.deutsche-boerse.com/browse/" + ticket.epic}
                >
                  {ticket.epic_name}
                </ChakraLink>
              </Td>
              <Td>
                <Flex gap="2">
                  {ticket.parents?.map(key => (
                    <ChakraLink
                      key={key}
                      target="_blank"
                      href={"https://devopsjira.deutsche-boerse.com/browse/" + key}
                    >
                      {key}
                    </ChakraLink>
                  ))}
                </Flex>
              </Td>
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

function DaySummary({ tickets }: { tickets: TicketsResponse[] }) {
  const { sprintId } = Route.useParams()
  const { selectedDate, selectedDev } = Route.useSearch()

  const { data: devs = [] } = useQuery({
    queryKey: [Collections.SprintDevsView, 'get-by-sprint', sprintId],
    queryFn: () => pb.collection(Collections.SprintDevsView).getFullList<SprintDevsViewResponse>({
      filter: `sprint = '${sprintId}'`,
      sort: 'dev'
    }),
  })

  const { data: staffing = [] } = useQuery({
    queryKey: [Collections.Staffing, sprintId, selectedDate],
    queryFn: () => pb.collection(Collections.Staffing).getFullList<StaffingResponse>({
      filter: `sprint = '${sprintId}' && utc_date < '${selectedDate} 00:00:00.000Z'`,
    }),
    enabled: !!selectedDate,
  })

  const byDev = useMemo(() => {
    const byId: Record<string, number> = {}

    for (const day of staffing) {
      byId[day.dev] = byId[day.dev] || 0
      byId[day.dev] += day.points
    }

    return byId
  }, [sprintId, selectedDate, staffing])


  const data = devs.filter(dev => dev.dev === selectedDev || !selectedDev).map(dev => {
    const done = tickets.filter(ticket => ticket.status === 'Done' && ticket.owner === dev.dev)
      .reduce((sum, ticket) => sum + (ticket.points || 0), 0)
    const to_val = tickets.filter(ticket => ticket.status === 'In Test' && ticket.owner === dev.dev)
      .reduce((sum, ticket) => sum + (ticket.points || 0), 0)
    const tbd = byDev[dev.dev] || 0

    return {
      soft: (done + to_val) - tbd,
      dev: dev.dev,
      to_val,
      done,
      tbd,
      late: done - tbd
    }
  })


  return (
    <Table size="sm" boxShadow="md" width="600px" rounded="lg" background="white">
      <Thead>
        <Tr background="green.500">
          <Th color="white">Soft</Th>
          <Th color="white">Dev</Th>
          <Th color="white">To Val</Th>
          <Th color="white">Done</Th>
          <Th color="white">TBD</Th>
          <Th color="white">Late</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map(row => (
          <Tr key={row.dev} background={selectedDev === row.dev ? 'blue.100' : undefined}>
            <Td>{row.soft}</Td>
            <Td>{row.dev}</Td>
            <Td>{row.to_val}</Td>
            <Td>{row.done}</Td>
            <Td>{row.tbd}</Td>
            <Td>{row.late}</Td>
          </Tr>
        ))}
        <Tr borderTop="3px solid" borderColor="gray.300">
          <Td>{data.reduce((sum, row) => sum + row.soft, 0)}</Td>
          <Td fontWeight="bold">Total</Td>
          <Td>{data.reduce((sum, row) => sum + row.to_val, 0)}</Td>
          <Td>{data.reduce((sum, row) => sum + row.done, 0)}</Td>
          <Td>{data.reduce((sum, row) => sum + row.tbd, 0)}</Td>
          <Td>{data.reduce((sum, row) => sum + row.late, 0)}</Td>
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

  const final_date = getNextDate(dates.length > 0 ? dates[dates.length - 1].date : null)

  return (
    <>
      <Link to="/$sprintId/daily" params={{ sprintId }} search={{ selectedDev, view }}>
        <Button size="sm">reset date</Button>
      </Link>
      {dates.map(date => {
        const _selectedDate = date.date
        return (
          <Link
            key={date.id}
            to="/$sprintId/daily"
            params={{ sprintId }}
            search={{ selectedDate: _selectedDate, selectedDev, view }}>
            <Button variant="outline" colorScheme="green" isActive={selectedDate === _selectedDate} size="sm">{_selectedDate}</Button>
          </Link>
        )
      })}
      <Link
        to="/$sprintId/daily"
        params={{ sprintId }}
        search={{ selectedDate: final_date, selectedDev, view }}>
        <Button variant="outline" colorScheme="green" isActive={selectedDate === final_date} size="sm">{final_date}</Button>
      </Link>
    </>
  )
}

function DevsBtns() {
  const { sprintId } = Route.useParams()
  const { selectedDate, selectedDev, view } = Route.useSearch()

  const { data: devs = [] } = useQuery({
    queryKey: [Collections.SprintDevsView, 'get-by-sprint', sprintId],
    queryFn: () => pb.collection(Collections.SprintDevsView).getFullList<SprintDevsViewResponse>({
      filter: `sprint = '${sprintId}'`,
      sort: 'name',
    }),
  })

  return (
    <>
      <Link to="/$sprintId/daily" params={{ sprintId }} search={{ selectedDate, view }}>
        <Button size="sm">reset dev</Button>
      </Link>
      {devs.map(dev => {
        return (
          <Link
            key={dev.dev}
            to="/$sprintId/daily"
            params={{ sprintId }}
            search={{ selectedDate, selectedDev: dev.dev, view }}
          >
            <Button variant="outline" colorScheme="blue" size="sm" isActive={selectedDev === dev.dev}>{dev.dev}</Button>
          </Link>
        )
      })}
    </>
  )
}


function filterIfWasDoneYesterday(old_tickets: TicketsResponse[]) {
  return (ticket: TicketsResponse) => {
    if (ticket.status !== 'Done') return true
    const old_status = old_tickets.find(old_ticket => old_ticket.key === ticket.key)?.status

    return old_status !== 'Done'
  }
}

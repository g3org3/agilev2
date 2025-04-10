import {
  Link as ChakraLink,
  Avatar,
  Button,
  Flex,
  Heading,
  Spacer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Select,
  Skeleton,
  Text,
  useColorModeValue
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import z from 'zod'
import { DateTime } from 'luxon'

import { getNextDate } from '@/services/dates'
import { pb } from '@/services/pb'
import {
  Collections,
  SprintDatesViewResponse,
  SprintDevsViewResponse,
  SprintsViewResponse,
  StaffingResponse,
  TicketsResponse
} from '@/services/pocketbase-types'
import DepGraph from '@/components/DepGraph'
import { BDC } from '@/components/BDC'
import Investigations from '@/components/Investigations'
import { sortByStatus } from '@/services/sort'
import { throttle } from '@/services/throttle'
import { queryClient } from '@/services/queryClient'
import { ButtonLink } from '@/components/ButtonLink'

const filterBySchema = z.enum(['problems', 'problem-solving', '']).nullish()

export const Route = createFileRoute('/$sprintId/daily')({
  component: Daily,
  validateSearch: z.object({
    selectedDate: z.string().nullish(),
    selectedDev: z.string().nullish(),
    view: z.enum(['', 'table', 'trello']).nullish(),
    filterBy: filterBySchema,
    viewSummary: z.boolean().nullish(),
    viewInvestigations: z.boolean().nullish(),
    depGraph: z.string().nullish(),
  })
})

function Daily() {
  const bg = useColorModeValue('white', 'gray.700')
  const { sprintId } = Route.useParams()
  const {
    selectedDate,
    selectedDev = '',
    view = 'table',
    filterBy,
    viewSummary = true,
    depGraph,
    viewInvestigations
  } = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data: dates = [] } = useQuery({
    queryKey: [sprintId, Collections.SprintDatesView],
    queryFn() {
      return pb.collection(Collections.SprintDatesView)
        .getFullList<SprintDatesViewResponse>({
          filter: `sprint = '${sprintId}'`
        })
    }
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
  }, [selectedDate, dates, sprintId, navigate])

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (e.key === 'q') {
        navigate({
          to: '/'
        })
        return
      }
      const i = dates.findIndex(x => x.date === selectedDate)
      let nextDate = null
      if (e.key === 'ArrowRight' || e.key === 'l') {
        nextDate = dates[i + 1]
      }
      if (e.key === 'ArrowLeft' || e.key === 'h') {
        nextDate = dates[i - 1]
      }
      if (nextDate) {
        navigate({
          to: '/$sprintId/daily',
          params: { sprintId },
          search: (rest) => ({ ...rest, selectedDate: nextDate.date })
        })
      }
      if (e.key === 'ArrowDown' || e.key === 'j') {
        const num = Number(sprintId.split(' ')[1]) - 1
        navigate({
          to: '/$sprintId/daily',
          params: { sprintId: `Sprint ${num}` }
        })
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        const num = Number(sprintId.split(' ')[1]) + 1
        navigate({
          to: '/$sprintId/daily',
          params: { sprintId: `Sprint ${num}` }
        })
      }
      if (e.key === 'i') {
        navigate({
          to: '/$sprintId/daily',
          params: { sprintId },
          search: (rest) => ({ ...rest, viewInvestigations: !rest.viewInvestigations })
        })
      }
      if (e.key === 's') {
        navigate({
          to: '/$sprintId/daily',
          params: { sprintId },
          search: (rest) => ({ ...rest, viewSummary: !viewSummary })
        })
      }
    }
    window.addEventListener('keydown', callback)
    return () => {
      window.removeEventListener('keydown', callback)
    }
  }, [dates, navigate, selectedDate, sprintId, viewSummary])

  const previous_day = useMemo(() => {
    const index = dates.map(date => date.date)
      .findIndex((date) => date === selectedDate)

    return index === 0 || index === -1 ? null : dates[index - 1].date
  }, [dates, selectedDate])

  const filter = `sprint = '${sprintId}' && date = '${selectedDate}'`

  const { data: full_tickets_hack = [], isFetching: isFetchingTickets } = useQuery({
    queryKey: [sprintId, Collections.Tickets, selectedDate, selectedDev],
    queryFn: () => pb.collection(Collections.Tickets)
      .getFullList<TicketsResponse<string[], string[]>>({
        filter: selectedDev ? filter + ` && owner = '${selectedDev}'` : filter,
        sort: 'status',
      }),
    enabled: !!selectedDate,
  })
  const tickets = full_tickets_hack.filter(ticket => ticket.status !== 'To Do')

  const old_filter = `sprint = '${sprintId}' && date = '${previous_day}' && status != 'To Do'`
  const { data: old_tickets = [], isFetching: isFetchingOldTickets } = useQuery({
    queryKey: [sprintId, Collections.Tickets, 'old', previous_day, selectedDev],
    queryFn: () => pb.collection(Collections.Tickets)
      .getFullList<TicketsResponse<string[], string[]>>({
        filter: selectedDev ? old_filter + ` && owner = '${selectedDev}'` : old_filter,
        sort: 'status',
      }),
    enabled: !!previous_day,
  })

  const { data: sprint } = useQuery({
    queryKey: [sprintId, Collections.SprintsView],
    queryFn: () => pb.collection(Collections.SprintsView)
      .getOne<SprintsViewResponse<number, number, number, number>>(sprintId)
  })

  useEffect(() => {
    const invalidate = throttle(() => {
      queryClient.invalidateQueries({
        queryKey: [sprintId, Collections.Tickets, selectedDate, selectedDev],
      })
      queryClient.invalidateQueries({
        queryKey: [sprintId, Collections.Tickets, 'old', previous_day, selectedDev],
      })
      queryClient.invalidateQueries({
        queryKey: [sprintId, Collections.SprintsView],
      })
    }, 5000)

    pb.collection(Collections.Tickets).subscribe<TicketsResponse>('*', (e) => {
      if (sprintId == e.record.sprint) {
        invalidate()
      }
    })
    return () => {
      pb.collection(Collections.Tickets).unsubscribe('*')
    }
  }, [previous_day, selectedDate, selectedDev, sprintId])

  const tickets_or_cache = useMemo(() => {
    let _tickets = tickets.length > 0 ? tickets : old_tickets
    if (filterBy === 'problems') {
      _tickets = _tickets.filter((ticket) => {
        const labels = ticket.labels?.join(' ') || ''
        const problems = ['ko', 'return', 'wrong', 'estimated', 'missed']
        return problems.filter(problem => labels.includes(problem)).length > 0
      })
    }

    if (filterBy === 'problem-solving') {
      _tickets = _tickets.filter((ticket) => {
        const warning = ['Done', 'In Test'].includes(ticket.status)
          ? null
          : old_tickets.find(old_ticket => old_ticket.key === ticket.key)?.status

        return !!warning;
      })
    }

    return _tickets
  }, [old_tickets, tickets, filterBy])

  return (
    <>
      <Heading fontWeight="regular">
        <Flex
          gap="2"
          flexDir={{ base: "column", md: "row" }}
          bg={bg}
          alignItems={{ base: 'unset', md: "center" }}
          boxShadow="md"
          rounded="lg"
          p="3">
          <Flex alignItems="center" gap="2">
            <ButtonLink>
              <Text fontSize="xx-large">◀️ </Text>
            </ButtonLink>
            {sprintId} | <small>{sprint?.done_points} / {sprint?.tbd_points} points</small>
          </Flex>
          <Link
            to="/$sprintId/daily"
            params={{ sprintId }}
            search={(params) => ({ ...params, viewSummary: !viewSummary })}
          >
            <Button
              w={{ base: '100%', md: 'unset' }}
              isActive={!!viewSummary}
              variant="outline"
              size="sm"
              name="toggle summary"
              colorScheme="green">
              summary
            </Button>
          </Link>
          <Link
            to="/$sprintId/daily"
            params={{ sprintId }}
            search={(params) => ({ ...params, viewInvestigations: !viewInvestigations })}
          >
            <Button
              name="toggle investigations"
              w={{ base: '100%', md: 'unset' }}
              isActive={!!viewInvestigations}
              size="sm"
              variant="outline"
              colorScheme="purple">
              investigations
            </Button>
          </Link>
          <Spacer />
          <Filter />
          <DevsBtns />
          <DateBtns />
          <Link
            to="/$sprintId/daily"
            params={{ sprintId }}
            search={(params) => ({ ...params, view: view === 'table' ? 'trello' : 'table' })}
          >
            <Button w={{ base: '100%', md: 'unset' }} variant="ghost" colorScheme="blue">
              change to {view === 'table' ? 'trello' : 'table'}
            </Button>
          </Link>
        </Flex>
      </Heading >
      {viewInvestigations && selectedDate && <Investigations sprintId={sprintId} selectedDate={selectedDate} selectedDev={selectedDev} />
      }
      {
        depGraph ? (
          <DepGraph
            isLoading={isFetchingTickets || isFetchingOldTickets}
            selectedDate={selectedDate}
            track={depGraph}
            tickets={full_tickets_hack} />
        ) : (
          <Flex overflow="auto" gap="2" alignItems={{ base: 'unset', md: "flex-start" }} flex="1" flexDir={{ base: "column", md: "row" }}>
            {viewSummary ? (
              <Flex flexDir="column" gap={4} position="relative">
                <DaySummary tickets={tickets_or_cache} />
                {(isFetchingTickets || isFetchingOldTickets) && <Flex background="gray.100" w="100%" h="436px" position="absolute" bottom="0" zIndex="10" opacity="0.8"></Flex>}
                <BDC sprintId={sprintId} tickets={tickets_or_cache} tbd_points={sprint?.tbd_points} />
              </Flex>
            ) : null}
            <Flex flexDir="column" flex="1" height="100%" overflow="auto" paddingBottom="4" paddingLeft="2" position="relative">
              {(isFetchingTickets || isFetchingOldTickets) && <Flex background="gray.100" w="100%" h="100%" position="absolute" zIndex="10" opacity="0.8"></Flex>}
              {view === 'table' ? <TableTickets tickets={tickets_or_cache} old_tickets={old_tickets} /> : null}
              {view === 'trello' ? <TrelloTickets tickets={tickets_or_cache} old_tickets={old_tickets} /> : null}
            </Flex>
          </Flex>
        )
      }
    </>
  )
}

function TrelloTickets({ tickets, old_tickets }: { tickets: TicketsResponse[], old_tickets: TicketsResponse[] }) {
  return (
    <Flex gap="4" flex="1" paddingBottom="5" height="100%" overflow="auto" minW="1200px">
      <TrelloColumn tickets={tickets} old_tickets={old_tickets} status='To Develop' label='Daily' />
      <TrelloColumn tickets={tickets} old_tickets={old_tickets} status='In Progress' label='Doing' />
      <TrelloColumn tickets={tickets} old_tickets={old_tickets} status='In Review' label='Code Review' />
      <TrelloColumn tickets={tickets} old_tickets={old_tickets} status='In Test' label='To Validate' />
      <TrelloColumn tickets={tickets.filter(filterIfWasDoneYesterday(old_tickets))} old_tickets={old_tickets} status='Done' label='Done' />
    </Flex>
  )
}

function TrelloColumn({ tickets, status, label, old_tickets }: { tickets: TicketsResponse[], status: string, label: string, old_tickets: TicketsResponse[] }) {
  const bg = useColorModeValue('white', 'gray.700')
  const bgYellow = useColorModeValue('yellow.100', 'yellow.600')
  const bgOrange = useColorModeValue('orange.100', 'orange.600')
  const bgGreen = useColorModeValue('green.100', 'green.600')
  const bgRed = useColorModeValue('red.100', 'red.600')
  const column_tickets = tickets.filter(ticket => ticket.status === status)
  return (
    <Flex flexDir="column" boxShadow="md" width="20%" flex="1" overflow="auto" background={bg} rounded="md">
      <Flex px="4" py="2" background="blue.600" fontWeight="bold" alignItems="center">
        <Flex color="white">{label}</Flex>
        <Spacer />
        <Flex
          h="36px"
          w="36px"
          background={bg}
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

          let color = !warning ? bg : bgRed
          if (warning != 'In Test' && ticket.status === 'In Test') {
            color = bgYellow
          }
          if (warning == 'In Test' && ticket.status === 'In Test') {
            color = bgOrange
          }
          if (ticket.status === 'Done') {
            color = bgGreen
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
  const bg = useColorModeValue('white', 'gray.700')
  const bgYellow = useColorModeValue('yellow.100', 'yellow.600')
  const bgOrange = useColorModeValue('orange.100', 'orange.600')
  const bgGreen = useColorModeValue('green.100', 'green.600')
  const bgRed = useColorModeValue('red.100', 'red.600')
  const { sprintId } = Route.useParams()
  const { viewSummary = true } = Route.useSearch()

  return (
    <Table size="sm" boxShadow="md" background={bg} rounded="lg">
      <Thead>
        <Tr background="blue.500">
          <Th color="white" p="2">Ticket</Th>
          <Th color="white">Owner</Th>
          <Th display={{ base: 'none', md: 'table-cell' }} color="white">Summary</Th>
          {!viewSummary && <>
            <Th display={{ base: 'none', md: 'table-cell' }} color="white">Labels</Th>
            <Th display={{ base: 'none', md: 'table-cell' }} color="white">Epic</Th>
            <Th display={{ base: 'none', md: 'table-cell' }} color="white">BlockedBy</Th>
          </>}
          <Th color="white">Status</Th>
          <Th color="white">Points</Th>
          <Th display={{ base: 'none', md: 'table-cell' }} color="white">Warning</Th>
        </Tr>
      </Thead>
      <Tbody>
        {tickets.sort(sortByStatus).filter(filterIfWasDoneYesterday(old_tickets)).map(ticket => {
          const warning = ['Done'].includes(ticket.status)
            ? null
            : old_tickets.find(old_ticket => old_ticket.key === ticket.key)?.status

          let color = !warning ? undefined : bgRed
          if (warning != 'In Test' && ticket.status === 'In Test') {
            color = bgYellow
          }
          if (warning == 'In Test' && ticket.status === 'In Test') {
            color = bgOrange
          }
          if (ticket.status === 'Done') {
            color = bgGreen
          }

          return (
            <Tr background={color} key={ticket.key}>
              <Td whiteSpace="nowrap">
                <ChakraLink
                  target="_blank"
                  href={"https://devopsjira.deutsche-boerse.com/browse/" + ticket.key}
                >
                  {ticket.key}
                </ChakraLink>
              </Td>
              <Td><Avatar title={ticket.owner} size="sm" name={ticket.owner.replace(' EXT', '')} /></Td>
              <Td display={{ base: 'none', md: 'table-cell' }} title={ticket.summary}>{ticket.summary.substring(0, 110)}...</Td>
              {!viewSummary && <>
                <Td display={{ base: 'none', md: 'table-cell' }}>{ticket.labels?.join(', ')}</Td>
                <Td display={{ base: 'none', md: 'table-cell' }}>
                  <ChakraLink
                    target="_blank"
                    href={"https://devopsjira.deutsche-boerse.com/browse/" + ticket.epic}
                  >
                    {ticket.epic_name}
                  </ChakraLink>
                  {ticket.epic_name && <Link
                    to="/$sprintId/daily"
                    params={{ sprintId }}
                    search={(params) => ({ ...params, depGraph: ticket.epic })}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      dp
                    </Button>
                  </Link>}
                </Td>
                <Td display={{ base: 'none', md: 'table-cell' }}>
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
              </>}
              <Td whiteSpace="nowrap">{ticket.status}</Td>
              <Td>{ticket.points}</Td>
              <Td display={{ base: 'none', md: 'table-cell' }}>{warning}</Td>
            </Tr>
          )
        })}
      </Tbody>
    </Table>
  )
}

function DaySummary({ tickets }: { tickets: TicketsResponse[] }) {
  const bg = useColorModeValue('white', 'gray.700')
  const { sprintId } = Route.useParams()
  const { selectedDate, selectedDev } = Route.useSearch()

  const { data: devs = [], isFetching: isFetchingDevs } = useQuery({
    queryKey: [sprintId, Collections.SprintDevsView],
    queryFn: () => pb.collection(Collections.SprintDevsView).getFullList<SprintDevsViewResponse>({
      filter: `sprint = '${sprintId}'`,
      sort: 'dev'
    }),
  })

  const { data: staffing = [], isFetching: isFetchingStaffing } = useQuery({
    queryKey: [sprintId, Collections.Staffing, selectedDate],
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
  }, [staffing])


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

  if (isFetchingDevs || isFetchingStaffing) {
    return <Flex flexDir="column" width={{ base: '100%', md: '600px' }} rounded="lg">
      <Skeleton height="200px" rounded="lg" boxShadow="md" />
    </Flex>
  }


  return (
    <Table size="sm" boxShadow="md" width={{ base: '100%', md: '600px' }} rounded="lg" background={bg}>
      <Thead>
        <Tr background="green.500">
          <Th color="white">Soft</Th>
          <Th color="white">Dev</Th>
          <Th display={{ base: 'none', md: 'table-cell' }} color="white">To Val</Th>
          <Th display={{ base: 'none', md: 'table-cell' }} color="white">Done</Th>
          <Th display={{ base: 'none', md: 'table-cell' }} color="white">TBD</Th>
          <Th display={{ base: 'none', md: 'table-cell' }} color="white">Late</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map(row => (
          <Tr key={row.dev} background={selectedDev === row.dev ? 'blue.100' : undefined}>
            <Td>{row.soft}</Td>
            <Td>{row.dev}</Td>
            <Td display={{ base: 'none', md: 'table-cell' }}>{row.to_val}</Td>
            <Td display={{ base: 'none', md: 'table-cell' }}>{row.done}</Td>
            <Td display={{ base: 'none', md: 'table-cell' }}>{row.tbd}</Td>
            <Td display={{ base: 'none', md: 'table-cell' }}>{row.late}</Td>
          </Tr>
        ))}
        <Tr borderTop="3px solid" borderColor="gray.300">
          <Td>{data.reduce((sum, row) => sum + row.soft, 0)}</Td>
          <Td fontWeight="bold">Total</Td>
          <Td display={{ base: 'none', md: 'table-cell' }}>{data.reduce((sum, row) => sum + row.to_val, 0)}</Td>
          <Td display={{ base: 'none', md: 'table-cell' }}>{data.reduce((sum, row) => sum + row.done, 0)}</Td>
          <Td display={{ base: 'none', md: 'table-cell' }}>{data.reduce((sum, row) => sum + row.tbd, 0)}</Td>
          <Td display={{ base: 'none', md: 'table-cell' }}>{data.reduce((sum, row) => sum + row.late, 0)}</Td>
        </Tr>
      </Tbody>
    </Table>
  )
}

function Filter() {
  const navigate = Route.useNavigate()
  const { sprintId } = Route.useParams()
  const { filterBy } = Route.useSearch()

  const onSelectDev: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    const value = filterBySchema.parse(event.target.value)

    navigate({
      to: "/$sprintId/daily",
      params: { sprintId },
      search: (params) => ({ ...params, filterBy: value || undefined }),
    })
  }

  return (
    <>
      <Select maxW={{ base: '100%', md: '200px' }} value={filterBy || ""} onChange={onSelectDev}>
        <option value="">filter by</option>
        <option>problems</option>
        <option>problem-solving</option>
      </Select>
    </>
  )
}


function prettyISODate(datestr?: string | null) {
  if (!datestr) return null

  const date = DateTime.fromSQL(`${datestr} 00:00:00.000Z`)

  return date.toFormat('EEE d MMM')
}

function DateBtns() {
  const { sprintId } = Route.useParams()
  const { selectedDate } = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data: dates = [] } = useQuery({
    queryKey: [sprintId, Collections.SprintDatesView],
    queryFn: () => pb.collection(Collections.SprintDatesView).getFullList<SprintDatesViewResponse>({
      filter: `sprint = '${sprintId}'`
    })
  })

  useEffect(() => {
    const invalidate = throttle(() => {
      queryClient.invalidateQueries({ queryKey: [sprintId, Collections.Staffing, selectedDate] })
      queryClient.invalidateQueries({ queryKey: [sprintId, Collections.SprintDevsView] })
      queryClient.invalidateQueries({ queryKey: [sprintId, Collections.SprintDatesView] })
    }, 5000)
    pb.collection(Collections.Staffing).subscribe<StaffingResponse>('*', (e) => {
      if (e.record.sprint === sprintId) {
        invalidate()
      }
    })

    return () => {
      pb.collection(Collections.Staffing).unsubscribe('*')
    }
  }, [selectedDate, sprintId])

  const final_date = getNextDate(dates.length > 0 ? dates[dates.length - 1].date : null)

  const onSelectDev: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    navigate({
      to: "/$sprintId/daily",
      params: { sprintId },
      search: (params) => ({ ...params, selectedDate: event.target.value }),
    })
  }

  return (
    <>
      <Select maxW={{ base: '100%', md: '200px' }} value={selectedDate || ""} onChange={onSelectDev} outline="2px solid green">
        <option value="">-</option>
        {dates.map(date => (
          <option key={date.id} value={date.date}>{prettyISODate(date.date)}</option>
        ))}
        <option value={final_date || ""}>{prettyISODate(final_date)}</option>
      </Select>
    </>
  )
}

function DevsBtns() {
  const { sprintId } = Route.useParams()
  const { selectedDev } = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data: devs = [] } = useQuery({
    queryKey: [sprintId, Collections.SprintDevsView],
    queryFn: () => pb.collection(Collections.SprintDevsView).getFullList<SprintDevsViewResponse>({
      filter: `sprint='${sprintId}'`,
      sort: 'dev',
    }),
  })

  const onSelectDev: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    navigate({
      to: "/$sprintId/daily",
      params: { sprintId },
      search: (params) => ({ ...params, selectedDev: event.target.value }),
    })
  }

  return (
    <>
      <Select maxW={{ base: '100%', md: '200px' }} value={selectedDev || ""} onChange={onSelectDev}>
        <option value="">filter by owner</option>
        <option value="">----</option>
        {devs.map(dev => (
          <option key={dev.dev}>{dev.dev}</option>
        ))}
        <option value="">----</option>
        <option value="">reset</option>
      </Select>
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

import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Button,
  Table,
  Thead,
  Th,
  Tr,
  Td,
  Text,
  Tbody,
  Heading,
  Badge,
  Container,
  Flex,
  Select,
  Skeleton,
  useColorModeValue,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { AxisOptions, Chart } from 'react-charts'
import z from 'zod'

import { pb } from '@/services/pb'
import {
  Collections,
  SprintsLabelsViewResponse,
  SprintsPointsTbdViewResponse,
  SprintsViewResponse,
  TicketsResponse,
} from '@/services/pocketbase-types'
import { throttle } from '@/services/throttle'
import { queryClient } from '@/services/queryClient'

export const Route = createFileRoute('/')({
  component: Home,
  validateSearch: z.object({
    project: z.enum(['compass', 'datafeed', 'all', '']).nullish(),
  }),
})

const invalidateQueries = throttle(() => {
  queryClient.invalidateQueries({
    queryKey: ['index', Collections.SprintsView],
  })
  queryClient.invalidateQueries({
    queryKey: ['index', Collections.SprintsLabelsView],
  })
}, 5000)

function Home() {
  const bg = useColorModeValue('white', 'gray.700')
  const bgHighlighted = useColorModeValue('blue.50', 'gray.600')

  const { project = 'compass' } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: rawsprints = [], isFetching: isFetchingSprint } = useQuery({
    queryKey: ['index', Collections.SprintsView],
    queryFn: () =>
      pb
        .collection(Collections.SprintsView)
        .getFullList<SprintsViewResponse<number, number, number, number>>({
          sort: '-sprint',
        }),
  })

  useEffect(() => {
    console.log('subscribed')
    pb.collection(Collections.Tickets).subscribe<TicketsResponse>('*', () => {
      invalidateQueries()
    })

    return () => {
      pb.collection(Collections.Tickets).unsubscribe('*')
    }
  }, [])

  const { data: sprintlabels = [], isFetching: isFetchingLabels } = useQuery({
    queryKey: ['index', Collections.SprintsLabelsView],
    queryFn: () =>
      pb
        .collection(Collections.SprintsLabelsView)
        .getFullList<
          SprintsLabelsViewResponse<number, number, number, number>
        >(),
  })

  // filter sprints
  let sprints = rawsprints

  if (project === 'datafeed') {
    sprints = sprints.filter(
      (sprint) =>
        sprint.sprint.includes('Datafeed') &&
        ![
          'Datafeed - Sprint 1',
          'Datafeed - Sprint 2',
          'Datafeed - Sprint 3',
          'Datafeed - Sprint 4',
        ].includes(sprint.sprint)
    )
  }

  if (project === 'compass') {
    sprints = sprints.filter((sprint) => !sprint.sprint.includes('Datafeed'))
  }

  const problemsBySprint = useMemo(() => {
    const _bySprint: Record<
      string,
      SprintsLabelsViewResponse<number, number, number, number>
    > = {}
    for (const sprint of sprintlabels) {
      _bySprint[sprint.sprint] = sprint
    }

    return _bySprint
  }, [sprintlabels])

  const skipped_sprints = [
    'Sprint 110',
    'Sprint 111',
    'Sprint 150',
    'Datafeed - Sprint 150',
    'Datafeed - Sprint 1',
    'Datafeed - Sprint 2',
    'Datafeed - Sprint 3',
    'Datafeed - Sprint 4',
  ]

  const problems = Object.keys(problemsBySprint)
    .filter((sprint) => {
      if (skipped_sprints.includes(sprint)) return false
      if (project === 'datafeed') {
        return sprint.includes('Datafeed')
      }
      if (project === 'compass') {
        return !sprint.includes('Datafeed')
      }
      return true
    })
    .map((sprint) => ({
      sprint,
      problems: problemsBySprint[sprint].total,
    }))

  const enhance_sprints = sprints.map((sprint) => {
    const { tbd_points = 1, to_val_points = 0, done_points = 0 } = sprint
    const pseudo_done = (done_points || 0) + (to_val_points || 0)
    const percentage = Math.floor((100 * pseudo_done) / (tbd_points || 1))

    return { ...sprint, pseudo_done, percentage }
  })

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const sprintId = enhance_sprints[0].sprint
        navigate({
          to: '/$sprintId/daily',
          params: { sprintId },
        })
      }
    }
    window.addEventListener('keydown', callback)
    return () => {
      window.removeEventListener('keydown', callback)
    }
  }, [enhance_sprints, navigate])

  const sprints_graph = enhance_sprints
    .filter((sprint) => !skipped_sprints.includes(sprint.sprint))
    .map((sprint) => ({ sprint: sprint.sprint, percentage: sprint.percentage }))
    .reverse()

  return (
    <>
      <Container maxW="container.xl" display="flex" flexDir="column" gap="4">
        <Heading fontWeight="regular">Sprints</Heading>
        <Flex gap="4" flexDirection={{ base: 'column', md: 'row' }}>
          <Flex bg={bg} boxShadow="lg" rounded="md" flex="1" height="324px">
            {!isFetchingLabels ? (
              <ProblemGraph problems={problems} />
            ) : (
              <Skeleton height="324px" width="100%" />
            )}
          </Flex>
          <Flex bg={bg} boxShadow="lg" rounded="md" flex="1" height="324px">
            {!isFetchingSprint ? (
              <SprintGraph sprints={sprints_graph} />
            ) : (
              <Skeleton height="324px" width="100%" />
            )}
          </Flex>
        </Flex>
        <Select
          value={project || ''}
          onChange={(e) =>
            navigate({
              to: '/',
              search: {
                project:
                  e.target.value === '' ? undefined : (e.target.value as never),
              },
            })
          }
        >
          <option value="">all</option>
          <option value="compass">Compass</option>
          <option value="datafeed">Data Feed</option>
        </Select>
        <Table background={bg} size="sm" boxShadow="md" rounded="md">
          <Thead>
            <Tr background="teal.600">
              <Th color="white">Actions</Th>
              <Th color="white">Sprint</Th>
              <Th color="white" display={{ base: 'none', md: 'table-cell' }}>
                Total Points
              </Th>
              <Th color="white">Completed</Th>
              <Th display={{ base: 'none', md: 'table-cell' }} color="white">
                Problems
              </Th>
              <Th color="white">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isFetchingSprint &&
              new Array(20).fill(0).map((_, index) => (
                <Tr key={`i-${index}`}>
                  <Td colSpan={6}>
                    <Skeleton height="10px" width="100%" />
                  </Td>
                </Tr>
              ))}
            <FutureSprints />
            {enhance_sprints.map((sprint, index) => (
              <Tr
                key={sprint.id}
                height={index === 0 ? '100px' : undefined}
                bg={index === 0 ? bgHighlighted : undefined}
              >
                <Td>
                  <Link
                    to="/$sprintId/staffing"
                    params={{ sprintId: sprint.id }}
                  >
                    <Button
                      leftIcon={<>👀</>}
                      variant="outline"
                      bg={index === 0 ? bg : undefined}
                      size={{ base: 'xs', md: index === 0 ? 'md' : 'sm' }}
                    >
                      staff
                    </Button>
                  </Link>
                </Td>
                <Td>{sprint.id}</Td>
                <Td display={{ base: 'none', md: 'table-cell' }}>
                  {sprint.tbd_points?.toFixed(1)}
                </Td>
                <Td>
                  <Badge
                    colorScheme={
                      sprint.percentage < 99
                        ? sprint.percentage < 90
                          ? 'red'
                          : 'orange'
                        : 'green'
                    }
                    rounded="lg"
                    px="2"
                  >
                    {sprint.pseudo_done} / {sprint.tbd_points}
                  </Badge>
                </Td>
                <Td display={{ base: 'none', md: 'table-cell' }}>
                  {problemsBySprint[sprint.sprint]?.total}
                </Td>
                <Td>
                  <Link to="/$sprintId/daily" params={{ sprintId: sprint.id }}>
                    <Button
                      bg={index === 0 ? bg : undefined}
                      variant={index === 0 ? undefined : 'ghost'}
                      leftIcon={<>☀️</>}
                      boxShadow={index === 0 ? 'md' : undefined}
                      size={{ base: 'xs', md: index === 0 ? 'md' : 'sm' }}
                    >
                      daily
                    </Button>
                  </Link>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Container>
    </>
  )
}

function FutureSprints() {
  const { project } = Route.useSearch()
  const { data: rawsprints = [] } = useQuery({
    queryKey: ['index', Collections.SprintsView],
    queryFn: () =>
      pb
        .collection(Collections.SprintsView)
        .getFullList<SprintsViewResponse<number, number, number, number>>({
          sort: '-sprint',
        }),
  })

  const { data: tbdSprints = [] } = useQuery({
    queryKey: [Collections.SprintsPointsTbdView, project],
    queryFn() {
      return pb
        .collection(Collections.SprintsPointsTbdView)
        .getFullList<SprintsPointsTbdViewResponse<string, number, string>>({
          filter:
            project === 'datafeed'
              ? `sprint ~ 'datafeed'`
              : `sprint !~ 'datafeed'`,
          sort: '-sprint',
        })
    },
  })

  const futureSprints = useMemo(() => {
    const sprintIds = rawsprints.map((sprint) => sprint.sprint)
    sprintIds.push('Sprint 112')
    return tbdSprints.filter((sprint) => !sprintIds.includes(sprint.sprint))
  }, [rawsprints, tbdSprints])

  const nextSprint = useMemo(() => {
    const sprint = futureSprints[0]
    if (!sprint) return null
    const prefix = project === 'datafeed' ? 'Datafeed - ' : ''
    const [name, id] = sprint.sprint.replace(prefix, '').split(' ')
    const nextId = Number(id) + 1

    return `${prefix}${name} ${nextId}`
  }, [futureSprints, project])

  return (
    <>
      {nextSprint && pb.authStore.model?.isAdmin ? (
        <Tr>
          <Td colSpan={6}>
            <Flex justifyContent="center">
              <Link to="/$sprintId/admin" params={{ sprintId: nextSprint }}>
                <Button size="sm">Create new sprint {nextSprint}</Button>
              </Link>
            </Flex>
          </Td>
        </Tr>
      ) : null}
      {futureSprints.map((sprint) => (
        <Tr key={sprint.id}>
          <Td>
            <Link to="/$sprintId/staffing" params={{ sprintId: sprint.id }}>
              <Button
                leftIcon={<>👀</>}
                variant="ghost"
                color="gray.500"
                size={{ base: 'xs', md: 'sm' }}
              >
                staff
              </Button>
            </Link>
          </Td>
          <Td>
            <Text color="gray.500">{sprint.sprint}</Text>
          </Td>
          <Td colSpan={4}>
            <Text color="gray.500">{sprint.points}</Text>
          </Td>
        </Tr>
      ))}
    </>
  )
}

type SprintDatum = { sprint: string; percentage: number }
function SprintGraph({ sprints }: { sprints: SprintDatum[] }) {
  if (sprints.length < 1) return null

  type Series = {
    label: string
    data: SprintDatum[]
  }

  const data: Series[] = [
    {
      label: 'Completion Percentage',
      data: sprints,
    },
    {
      label: '100%',
      data: sprints.map((p) => ({ sprint: p.sprint, percentage: 100 })),
    },
    {
      label: '85%',
      data: sprints.map((p) => ({ sprint: p.sprint, percentage: 90 })),
    },
  ]

  const primaryAxis: AxisOptions<SprintDatum> = {
    getValue: (datum) => datum.sprint.replace('Datafeed - ', ''),
  }

  const secondaryAxes: AxisOptions<SprintDatum>[] = [
    {
      getValue: (datum) => datum.percentage,
      elementType: 'line',
    },
  ]

  return (
    <Flex flexDir="column" flex="1">
      <center>Sprint Completion Rate</center>
      <Flex display="inline-block" h={{ base: '200px', md: '300px' }} w="100%">
        <Chart
          options={{
            data,
            primaryAxis,
            secondaryAxes,
          }}
        />
      </Flex>
    </Flex>
  )
}

type MyDatum = { sprint: string; problems: number }
function ProblemGraph({ problems }: { problems: MyDatum[] }) {
  if (problems.length < 1) return null

  type Series = {
    label: string
    data: MyDatum[]
  }

  const data: Series[] = [
    {
      label: 'Problems',
      data: problems,
    },
  ]

  const primaryAxis: AxisOptions<MyDatum> = {
    getValue: (datum) => datum.sprint.replace('Datafeed - ', ''),
  }

  const secondaryAxes: AxisOptions<MyDatum>[] = [
    {
      getValue: (datum) => datum.problems,
      elementType: 'bar',
    },
  ]

  return (
    <Flex flexDir="column" flex="1">
      <center>Problems</center>
      <Flex display="inline-block" h={{ base: '200px', md: '300px' }} w="100%">
        <Chart
          options={{
            data,
            primaryAxis,
            secondaryAxes,
          }}
        />
      </Flex>
    </Flex>
  )
}

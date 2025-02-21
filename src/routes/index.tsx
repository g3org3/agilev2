import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Button,
  Table,
  Thead,
  Th,
  Tr,
  Td,
  Tbody,
  Heading,
  Badge,
  Container,
  Flex,
  Select,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { AxisOptions, Chart } from 'react-charts'
import z from 'zod'

import { pb } from '@/services/pb'
import {
  Collections,
  SprintsLabelsViewResponse,
  SprintsViewResponse,
} from '@/services/pocketbase-types'

export const Route = createFileRoute('/')({
  component: Home,
  validateSearch: z.object({
    project: z.enum(['compass', 'datafeed', 'all']).nullish(),
  }),
})

function Home() {
  const { project = 'compass' } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: rawsprints = [], isFetching: isFetchingSprint } = useQuery({
    queryKey: [Collections.SprintsView, 'get-all', 'sort-sprint-desc'],
    queryFn: () =>
      pb
        .collection(Collections.SprintsView)
        .getFullList<SprintsViewResponse<number, number, number, number>>({
          sort: '-sprint',
        }),
  })

  const { data: sprintlabels = [], isFetching: isFetchingLabels } = useQuery({
    queryKey: [Collections.SprintsLabelsView, 'get-all'],
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
    'Sprint 142',
    'Datafeed - Sprint 142',
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

  const sprints_graph = enhance_sprints
    .filter((sprint) => !skipped_sprints.includes(sprint.sprint))
    .map((sprint) => ({ sprint: sprint.sprint, percentage: sprint.percentage }))
    .reverse()

  return (
    <>
      <Container maxW="container.xl" display="flex" flexDir="column" gap="4">
        <Heading fontWeight="regular">Sprints</Heading>
        <Flex gap="4" flexDirection={{ base: 'column', md: 'row' }}>
          <Flex bg="white" boxShadow="lg" rounded="md" flex="1">
            {!isFetchingLabels && <ProblemGraph problems={problems} />}
          </Flex>
          <Flex bg="white" boxShadow="lg" rounded="md" flex="1">
            {!isFetchingSprint && <SprintGraph sprints={sprints_graph} />}
          </Flex>
        </Flex>
        <Select
          value={project || ''}
          onChange={(e) =>
            navigate({
              to: '/',
              search: {
                project: e.target.value as never,
              },
            })
          }
        >
          <option value="">all</option>
          <option value="compass">Compass</option>
          <option value="datafeed">Data Feed</option>
        </Select>
        <Table background="white" size="sm" boxShadow="md" rounded="md">
          <Thead>
            <Tr background="teal.600">
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
            {enhance_sprints.map((sprint) => (
              <Tr key={sprint.id}>
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
                    <Button size={{ base: 'xs', md: 'sm' }}>view</Button>
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
    getValue: (datum) => datum.sprint,
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
    getValue: (datum) => datum.sprint,
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

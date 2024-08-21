import { pb } from '@/services/pb'
import {
  Collections,
  EpicsResponse,
  RoadmapResponse,
  SprintsResponse,
} from '@/services/pocketbase-types'
import {
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/roadmap')({
  component: Roadmap,
})

const lifecycle = [
  'done',
  'dev',
  'backlog',
  'conception',
  'ac',
  'design',
] as const
const colorByLC: Record<(typeof lifecycle)[number], string> = {
  done: 'green.50',
  dev: 'blue.50',
  backlog: 'yellow.50',
  conception: 'orange.50',
  ac: 'red.50',
  design: 'red.50',
}
const colorByRelease: Record<string, string> = {
  '24.09.01': 'blue.700',
  '24.10.01': 'orange.700',
  '24.12.01': 'green.700',
}

function Roadmap() {
  const { data: sprints = [] } = useQuery({
    queryKey: ['get-all', Collections.Sprints, 'sort-name'],
    queryFn: () =>
      pb
        .collection(Collections.Sprints)
        .getFullList<SprintsResponse>({ sort: 'name' }),
  })

  const { data: roadmap = [] } = useQuery({
    queryKey: [
      'get-all',
      Collections.Roadmap,
      'expand-done,dev,backlog,conception,ac,design,briefing',
    ],
    queryFn: () =>
      pb.collection(Collections.Roadmap).getFullList<
        RoadmapResponse<{
          done?: EpicsResponse[]
          dev?: EpicsResponse[]
          backlog?: EpicsResponse[]
          conception?: EpicsResponse[]
          ac?: EpicsResponse[]
          design?: EpicsResponse[]
          briefing?: EpicsResponse[]
        }>
      >({
        expand: 'done,dev,backlog,conception,ac,design,briefing',
      }),
  })

  return (
    <>
      <Flex>Sprints</Flex>
      <TableContainer py="5">
        <Table zIndex="5" position="fixed" w="100px" size="sm">
          <Thead>
            <Tr>
              <Th border="1px solid" background="white">
                Sprints
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td border="1px solid" background="white">
                <Flex p="1" fontWeight="bold">
                  Releases
                </Flex>
              </Td>
            </Tr>
            {lifecycle.map((step) => (
              <Tr>
                <Td
                  w="100px"
                  background={colorByLC[step]}
                  border="1px solid"
                  fontWeight="bold"
                  p="4"
                >
                  {step}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Table size="sm" background="white" boxShadow="md">
          <Thead>
            <Tr>
              <Th border="1px solid">Sprints</Th>
              {sprints.map((sprint) => (
                <Th border="1px solid" key={sprint.id}>
                  {sprint.name}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td border="1px solid">Release</Td>
              {sprints.map((sprint) => {
                const release = roadmap.find(
                  (row) => row.sprint === sprint.name
                )?.release

                return (
                  <Td border="1px solid" key={sprint.id}>
                    <Flex
                      color="white"
                      py="1"
                      px="4"
                      rounded="lg"
                      background={colorByRelease[release || '']}
                    >
                      {release}
                    </Flex>
                  </Td>
                )
              })}
            </Tr>
            {lifecycle.map((step) => (
              <Tr>
                <Td
                  background={colorByLC[step]}
                  border="1px solid"
                  fontWeight="bold"
                >
                  {step}
                </Td>
                {sprints.map((sprint) => (
                  <Td
                    background={colorByLC[step]}
                    border="1px solid"
                    key={sprint.id}
                  >
                    <Flex gap="2">
                      {roadmap
                        .find((row) => row.sprint === sprint.name)
                        ?.expand?.[step]?.map((d: EpicsResponse) => (
                          <Flex
                            background={d.background || 'gray.100'}
                            p="2"
                            rounded="md"
                          >
                            {d.name}
                          </Flex>
                        ))}
                    </Flex>
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Overview />
    </>
  )
}

function Overview() {
  const { data: roadmap = [] } = useQuery({
    queryKey: ['get-all', Collections.Roadmap, 'expand-done'],
    queryFn: () =>
      pb.collection(Collections.Roadmap).getFullList<
        RoadmapResponse<{
          done?: EpicsResponse[]
        }>
      >({
        expand: 'done',
      }),
  })

  const byRelease: Record<string, EpicsResponse[]> = {}

  for (const sprint of roadmap) {
    const { release } = sprint
    if (!byRelease[release]) {
      byRelease[release] = []
    }
    if (sprint.expand?.done) {
      const ids = sprint.expand.done.map((d) => d.id)
      const current_without_ids = byRelease[release].filter(
        (d) => !ids.includes(d.id)
      )
      byRelease[release] = Array.from(
        new Set(current_without_ids.concat(sprint.expand.done))
      )
    }
  }

  const releases = Object.keys(byRelease).sort()

  return (
    <>
      <Flex>Overview</Flex>
      <Flex background="white" boxShadow="md">
        {releases.map((release) => (
          <Flex
            p="3"
            gap="3"
            flexDir="column"
            w="300px"
            borderRight="1px solid"
          >
            <Flex fontSize="xl" borderBottom="1px solid" px="2">
              {release}
            </Flex>
            {byRelease[release].map((epic) => (
              <Flex px="4" py="1" background={epic.background} rounded="md">
                <Flex>{epic.status}</Flex>
                <Flex>{epic.name}</Flex>
              </Flex>
            ))}
          </Flex>
        ))}
      </Flex>
    </>
  )
}

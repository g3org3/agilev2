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
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'

import { pb } from '@/services/pb'
import {
  Collections,
  SprintsLabelsViewResponse,
  SprintsViewResponse,
} from '@/services/pocketbase-types'
import { useMemo } from 'react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { data: sprints = [] } = useQuery({
    queryKey: [Collections.SprintsView, 'get-all', 'sort-sprint-desc'],
    queryFn: () =>
      pb
        .collection(Collections.SprintsView)
        .getFullList<SprintsViewResponse<number, number, number, number>>({
          sort: '-sprint',
        }),
  })

  const { data: sprintlabels = [] } = useQuery({
    queryKey: [Collections.SprintsLabelsView, 'get-all'],
    queryFn: () =>
      pb
        .collection(Collections.SprintsLabelsView)
        .getFullList<
          SprintsLabelsViewResponse<number, number, number, number>
        >(),
  })

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

  return (
    <>
      <Container maxW="container.xl" display="flex" flexDir="column" gap="4">
        <Heading fontWeight="regular">Sprints</Heading>
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
            {sprints.map((sprint) => {
              const {
                tbd_points = 1,
                to_val_points = 0,
                done_points = 0,
              } = sprint
              const pseudo_done = (done_points || 0) + (to_val_points || 0)
              const percentage =
                Math.floor((100 * pseudo_done) / (tbd_points || 1)) - 100

              return (
                <Tr key={sprint.id}>
                  <Td>{sprint.id}</Td>
                  <Td display={{ base: 'none', md: 'table-cell' }}>
                    {tbd_points?.toFixed(1)}
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        percentage < 0
                          ? percentage < -9
                            ? 'red'
                            : 'orange'
                          : 'green'
                      }
                      rounded="lg"
                      px="3"
                    >
                      {pseudo_done} / {tbd_points}
                    </Badge>
                  </Td>
                  <Td display={{ base: 'none', md: 'table-cell' }}>
                    {problemsBySprint[sprint.sprint]?.total}
                  </Td>
                  <Td>
                    <Link
                      to="/$sprintId/daily"
                      params={{ sprintId: sprint.id }}
                    >
                      <Button size={{ base: 'xs', md: 'sm' }}>view</Button>
                    </Link>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Container>
    </>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Flex, Table, Thead, Th, Tr, Td, Tbody, Heading } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'

import { pb } from '@/services/pb'
import { Collections, SprintsViewResponse, } from '@/services/pocketbase-types'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { data: sprints = [] } = useQuery({
    queryKey: [Collections.SprintsView, 'get-all', 'sort-sprint-desc'],
    queryFn: () => pb.collection(Collections.SprintsView).getFullList<SprintsViewResponse<number, number, number, number>>({
      sort: '-sprint',
    })
  })

  return (
    <>
      <Heading fontWeight="regular">Sprints</Heading>
      <Table background="white" size="sm" boxShadow="md" rounded="md">
        <Thead>
          <Tr background="purple.500">
            <Th color="white" p="2">Sprint</Th>
            <Th color="white">Points TBD</Th>
            <Th color="white">Done Points</Th>
            <Th display={{ base: 'none', md: 'table-cell' }} color="white" colSpan={2}>Result (performance)</Th>
            <Th color="white">Actions</Th>
            <Th display={{ base: 'none', md: 'table-cell' }} color="white">Points in Sprint</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sprints.map(sprint => {
            const { tbd_points = 1, to_val_points = 0, done_points = 0 } = sprint
            const pseudo_done = (done_points || 0) + (to_val_points || 0)
            const diff = pseudo_done - (tbd_points || 0)
            const percentage = Math.floor(100 * pseudo_done / (tbd_points || 1)) - 100

            return (
              <Tr key={sprint.id}>
                <Td>{sprint.id}</Td>
                <Td>{tbd_points?.toFixed(1)}</Td>
                <Td display={{ base: 'none', md: 'table-cell' }}>{pseudo_done.toFixed(1)}</Td>
                <Td>
                  <Flex fontWeight="bold" color={diff < 0 ? 'red.600' : 'green.600'}>
                    {diff < 0 ? diff.toFixed(1) : `+${diff.toFixed(1)}`}
                  </Flex>
                </Td>
                <Td display={{ base: 'none', md: 'table-cell' }}>
                  <Flex fontWeight="bold" color={diff < 0 ? 'red.600' : 'green.600'}>
                    {percentage < 0 ? percentage.toFixed(1) : `+${percentage.toFixed(1)}`} %
                  </Flex>
                </Td>
                <Td>
                  <Link to="/$sprintId/daily" params={{ sprintId: sprint.id }}><Button size="sm">view</Button></Link>
                  {/* <Link><Button size="sm" disabled>staffing</Button></Link> */}
                </Td>
                <Td display={{ base: 'none', md: 'table-cell' }}>{sprint.total_points?.toFixed(1)}</Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </>
  )
}

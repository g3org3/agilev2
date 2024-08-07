import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Flex, Table, Thead, Th, Tr, Td, Tbody } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'

import { pb } from '@/services/pb'
import { Collections, SprintsViewResponse, } from '@/services/pocketbase-types'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { data: sprints = [] } = useQuery({
    queryKey: [Collections.SprintsView, 'get-all'],
    queryFn: () => pb.collection(Collections.SprintsView).getFullList<SprintsViewResponse<number, number, number, number>>()
  })

  return <Flex flexDir="column">
    <Table>
      <Thead>
        <Tr>
          <Th>Sprint</Th>
          <Th>Points TBD</Th>
          <Th>Done Points</Th>
          <Th>To Val Points</Th>
          <Th>Points in Sprint</Th>
          <Th>Completed</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {sprints.map(sprint => (
          <Tr key={sprint.id}>
            <Td>{sprint.sprint}</Td>
            <Td>{sprint.tbd_points}</Td>
            <Td>{sprint.done_points}</Td>
            <Td>{sprint.to_val_points}</Td>
            <Td>{sprint.total_points}</Td>
            <Td>{Math.floor(100 * (sprint.done_points || 0) / (sprint.tbd_points || 1))} %</Td>
            <Td display="flex" gap="2">
              <Link to="/$sprintId/daily" params={{ sprintId: sprint.id }}><Button>view</Button></Link>
              <Link><Button disabled>staffing</Button></Link>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </Flex>
}

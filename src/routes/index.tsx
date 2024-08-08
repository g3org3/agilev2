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
    queryKey: [Collections.SprintsView, 'get-all'],
    queryFn: () => pb.collection(Collections.SprintsView).getFullList<SprintsViewResponse<number, number, number, number>>()
  })

  return <Flex flexDir="column" gap="4" padding="4" background="whitesmoke" h="100dvh">
    <Heading>Agile</Heading>
    <Table size="sm" background="white" boxShadow="md" rounded="md">
      <Thead>
        <Tr background="purple.500">
          <Th color="white">Sprint</Th>
          <Th color="white">Points TBD</Th>
          <Th color="white">Done Points</Th>
          <Th color="white">To Val Points</Th>
          <Th color="white">Points in Sprint</Th>
          <Th color="white">Completed</Th>
          <Th color="white">Actions</Th>
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
              <Link to="/$sprintId/daily" params={{ sprintId: sprint.id }}><Button size="sm">view</Button></Link>
              <Link><Button size="sm" disabled>staffing</Button></Link>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </Flex>
}

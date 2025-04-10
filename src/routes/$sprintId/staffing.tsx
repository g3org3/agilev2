import { ButtonLink } from '@/components/ButtonLink'
import { pb } from '@/services/pb'
import { Collections, StaffingResponse } from '@/services/pocketbase-types'
import { queryClient } from '@/services/queryClient'
import { Button, Code, Container, Flex, Spacer, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DateTime } from 'luxon'
import { useMemo } from 'react'

export const Route = createFileRoute('/$sprintId/staffing')({
  component: Staffing,
})

export function Staffing() {
  const bg = useColorModeValue('white', 'gray.700')
  const bgHeader = useColorModeValue('blue.100', 'blue.700')
  const { sprintId } = Route.useParams()
  const { data = [] } = useQuery({
    queryKey: [sprintId, Collections.Staffing],
    queryFn: () => pb.collection(Collections.Staffing).getFullList<StaffingResponse>({ filter: `sprint='${sprintId}'` })
  })

  const staffByDev = useMemo(() => {
    const byDev: Record<string, StaffingResponse[]> = {}

    for (const item of data) {
      if (!byDev[item.dev]) {
        byDev[item.dev] = []
      }
      byDev[item.dev].push(item)
      byDev[item.dev].sort((a, b) => {
        return a.utc_date.localeCompare(b.utc_date)
      })
    }

    return byDev
  }, [data])

  const devs = useMemo(() => Object.keys(staffByDev).sort(), [staffByDev])
  const dates = useMemo(() => {
    if (devs.length === 0) return []

    return staffByDev[devs[0]].map(day => day.date)
  }, [staffByDev, devs])
  const points = useMemo(() => {
    const pointsByDev = Object.values(staffByDev).map(devDays => {
      return devDays.reduce((sum, day) => sum + day.points, 0)
    })

    return pointsByDev.reduce((sum, points) => sum + points, 0)
  }, [staffByDev])

  return (
    <Container display="flex" flexDir="column" maxW="container.2xl">
      <Flex alignItems="center" gap="3">
        <ButtonLink>
          <Text fontSize="xx-large">◀️ </Text>
        </ButtonLink>
        <Text fontSize="xx-large">Staffing</Text>
        <Spacer />
        <Text fontSize="xx-large">{points} Points</Text>
      </Flex>
      <Table boxShadow="md" rounded="md" bg={bg}>
        <Thead>
          <Tr>
            {pb.authStore.model?.isAdmin ? <Th bg={bgHeader}></Th> : null}
            <Th bg={bgHeader} textAlign="right">Points</Th>
            <Th bg={bgHeader} textAlign="right">Cel</Th>
            <Th bg={bgHeader}>Dev</Th>
            {dates.map(date => (
              <Th bg={bgHeader} textAlign="right" key={date}>
                {DateTime.fromSQL(`${date} 00:00:00.000Z`).toFormat('EEE LLL dd')}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {devs.map(dev => (
            <Tr>
              {pb.authStore.model?.isAdmin ? <Td><BulkButton days={staffByDev[dev]} /></Td> : null}
              <Td textAlign="right">
                {staffByDev[dev].reduce((sum, day) => sum + day.points, 0)}
              </Td>
              <Td textAlign="right">
                {Math.floor(staffByDev[dev].reduce((sum, day) => sum + day.points, 0) * 10 / 4.34) / 10}
              </Td>
              <Td>{dev}</Td>
              {staffByDev[dev].map(day => (
                <Td textAlign="right" key={dev + day.date}>
                  {pb.authStore.model?.isAdmin ?
                    <InputDay id={day.id} points={day.points} />
                    : day.points}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Code>{devs.join(',')}</Code>
    </Container>
  )
}


function BulkButton(props: { days: StaffingResponse[] }) {
  const { sprintId } = Route.useParams()

  const { mutateAsync } = useMutation({
    mutationFn: ({ id, points }: { id: string, points: number }) => {
      return pb.collection(Collections.Staffing).update(id, { points })
    }
  })

  const onStaffChange = async () => {
    const points = prompt("new points")
    if (points == null || points.trim() === '') return

    for (const day of props.days) {
      await mutateAsync({ id: day.id, points: Number(points) })
    }
    queryClient.invalidateQueries({ queryKey: [sprintId, Collections.Staffing] })
  }

  return <Button onClick={onStaffChange} size="sm">bulk</Button>
}

function InputDay(props: { points: number, id: string }) {
  const bg = useColorModeValue('whitesmoke', 'gray.600')
  const { sprintId } = Route.useParams()

  const { mutate } = useMutation({
    mutationFn: ({ id, points }: { id: string, points: number }) => {
      return pb.collection(Collections.Staffing).update(id, { points })
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [sprintId, Collections.Staffing] })
    }
  })

  const onStaffChange = () => {
    const points = prompt("new points")
    if (points == null || points.trim() === '') return
    mutate({ id: props.id, points: Number(points) })
  }

  return <Text p="2" onClick={onStaffChange} bg={bg}>{props.points}</Text>
}

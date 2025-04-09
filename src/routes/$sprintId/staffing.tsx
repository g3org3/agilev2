import { pb } from '@/services/pb'
import { Collections, StaffingResponse } from '@/services/pocketbase-types'
import { Code, Flex, Spacer, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DateTime } from 'luxon'
import { useMemo } from 'react'

export const Route = createFileRoute('/$sprintId/staffing')({
  component: Staffing,
})

export function Staffing() {
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
    <Flex flexDir="column">
      <Flex>
        <Text fontSize="xx-large">Staffing</Text>
        <Spacer />
        <Text fontSize="xx-large">{points} Points</Text>
      </Flex>
      <Table boxShadow="md" rounded="md" bg="white">
        <Thead>
          <Tr>
            <Th bg="blue.100" textAlign="right">Points</Th>
            <Th bg="blue.100">Dev</Th>
            {dates.map(date => (
              <Th bg="blue.100" textAlign="right" key={date}>
                {DateTime.fromSQL(`${date} 00:00:00.000Z`).toFormat('EEE LLL dd')}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {devs.map(dev => (
            <Tr>
              <Td textAlign="right">
                {staffByDev[dev].reduce((sum, day) => sum + day.points, 0)}
              </Td>
              <Td>{dev}</Td>
              {staffByDev[dev].map(day => (
                <Td textAlign="right" key={dev + day.date}>{day.points}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Code>{devs.join(',')}</Code>
    </Flex>
  )
}

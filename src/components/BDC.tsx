import { Flex, Text } from '@chakra-ui/react'
import { AxisOptions, Chart } from 'react-charts'

import {
  Collections,
  StaffingResponse,
  TicketsResponse,
} from '@/services/pocketbase-types'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/services/pb'
import { useMemo } from 'react'
import { getNextDate } from '@/services/dates'

interface Props {
  tickets: TicketsResponse<string[], string[]>[]
  sprintId: string
  tbd_points?: number | null
}

type MyDatum = { date: string; points: number }

export function BDC(props: Props) {
  const { data: staffing = [] } = useQuery({
    queryKey: [Collections.Staffing, props.sprintId],
    queryFn: () =>
      pb.collection(Collections.Staffing).getFullList<StaffingResponse>({
        filter: `sprint = '${props.sprintId}'`,
      }),
  })

  const byDay = useMemo(() => {
    const _by: Record<string, number> = {}
    for (const daydev of staffing) {
      if (_by[daydev.date] == null) {
        _by[daydev.date] = 0
      }
      _by[daydev.date] += daydev.points
    }
    return _by
  }, [staffing])

  const d = useMemo(() => {
    const data: MyDatum[] = []
    let total = props.tbd_points || 0
    const days = Object.keys(byDay)
    days.sort()
    for (const key of days) {
      data.push({
        date: key,
        points: total,
      })
      total -= byDay[key]
    }
    const lastDate = data.at(-1)?.date
    const newLastDate = getNextDate(lastDate)
    if (lastDate && newLastDate) {
      data.push({ date: newLastDate, points: 0 })
    }

    return data
  }, [props.tbd_points, byDay])

  type Series = {
    label: string
    data: MyDatum[]
  }

  const data: Series[] = [
    {
      label: 'Problems',
      data: d,
    },
  ]

  const primaryAxis: AxisOptions<MyDatum> = {
    getValue: (datum) => datum.date,
  }

  const secondaryAxes: AxisOptions<MyDatum>[] = [
    {
      getValue: (datum) => datum.points,
      elementType: 'line',
    },
  ]

  return (
    <Flex flexDir="column" bg="white" boxShadow="md" rounded="md">
      <Text pl={5} fontSize="x-large">
        BDC Chart
      </Text>
      <Flex display="inline-block" h={{ base: '200px', md: '400px' }} w="100%">
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

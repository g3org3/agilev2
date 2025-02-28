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


  const data: MyDatum[] = useMemo(() => {
    const _data: MyDatum[] = []
    let total = props.tbd_points || 0
    const days = Object.keys(byDay)
    days.sort()
    for (const key of days) {
      _data.push({
        date: key,
        points: total,
      })
      total -= byDay[key]
    }
    const lastDate = _data.at(-1)?.date
    const newLastDate = getNextDate(lastDate)
    if (lastDate && newLastDate) {
      _data.push({ date: newLastDate, points: 0 })
    }

    return _data
  }, [props.tbd_points, byDay])

  type Series = {
    label: string
    data: MyDatum[]
  }

  const series: Series[] = [
    {
      label: 'Problems',
      data,
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

  if (!props.tbd_points) return

  return (
    <Flex flexDir="column" bg="white" boxShadow="md" rounded="md">
      <Text pl={5} fontSize="x-large">
        BDC Chart
      </Text>
      <Flex display="inline-block" h={{ base: '200px', md: '400px' }} w="100%">
        <Chart
          options={{
            data: series,
            primaryAxis,
            secondaryAxes,
          }}
        />
      </Flex>
    </Flex>
  )
}

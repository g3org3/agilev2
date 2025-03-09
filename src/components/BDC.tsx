import { Flex, Text } from '@chakra-ui/react'
import { AxisOptions, Chart } from 'react-charts'

import {
  Collections,
  LatestSprintPointsViewResponse,
  StaffingResponse,
  TicketsResponse,
} from '@/services/pocketbase-types'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/services/pb'
import { useEffect, useMemo } from 'react'
import { getNextDate } from '@/services/dates'
import { throttle } from '@/services/throttle'
import { queryClient } from '@/services/queryClient'

interface Props {
  tickets: TicketsResponse<string[], string[]>[]
  sprintId: string
  tbd_points?: number | null
}

type MyDatum = { date: string; points: number }

export function BDC(props: Props) {
  const { data: staffing = [], isFetching: isLoading } = useQuery({
    queryKey: [Collections.Staffing, props.sprintId],
    queryFn: () =>
      pb.collection(Collections.Staffing).getFullList<StaffingResponse>({
        filter: `sprint = '${props.sprintId}'`,
      }),
  })

  const { data: last_sprint_points = [], isFetching: isLoading2 } = useQuery({
    queryKey: [Collections.LatestSprintPointsView, props.sprintId],
    queryFn: () =>
      pb
        .collection(Collections.LatestSprintPointsView)
        .getFullList<
          LatestSprintPointsViewResponse<number, number, number, number, number>
        >({
          filter: `sprint = '${props.sprintId}'`,
        }),
  })

  useEffect(() => {
    const invalidate = throttle(() => {
      queryClient.invalidateQueries({
        queryKey: [Collections.Staffing, props.sprintId],
      })
    }, 5000)

    pb.collection(Collections.Staffing).subscribe<StaffingResponse>(
      '*',
      (e) => {
        if (e.record.sprint === props.sprintId) {
          invalidate()
        }
      }
    )

    return () => {
      pb.collection(Collections.Staffing).unsubscribe('*')
    }
  }, [props.sprintId])

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

  const data = useMemo(() => {
    const _data = []
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
    const lastDate = _data[_data.length - 1]?.date
    const newLastDate = getNextDate(lastDate)
    if (lastDate && newLastDate) {
      _data.push({ date: newLastDate, points: 0 })
    }

    return _data satisfies MyDatum[]
  }, [props.tbd_points, byDay])

  const data2 = useMemo(() => {
    const total = props.tbd_points || 0
    const _data = []
    for (const day of last_sprint_points) {
      _data.push({
        date: day.date,
        points: total - (day.done_points || 0), // - (day.to_val_points || 0),
      })
    }

    return _data satisfies MyDatum[]
  }, [last_sprint_points, props.tbd_points])

  type Series = {
    label: string
    data: MyDatum[]
  }

  const series: Series[] = [
    {
      label: 'Ideal',
      data,
    },
    {
      label: 'Real',
      data: data2,
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
        Burndown Chart
      </Text>
      <Flex display="inline-block" h={{ base: '200px', md: '400px' }} w="100%">
        {props.tbd_points && !isLoading && !isLoading2 ? (
          <Chart
            options={{
              data: series,
              primaryAxis,
              secondaryAxes,
            }}
          />
        ) : null}
      </Flex>
    </Flex>
  )
}

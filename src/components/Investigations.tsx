import { Flex, Skeleton, useColorModeValue } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'

import { pb } from '@/services/pb'
import {
  Collections,
  InvestigationsResponse,
} from '@/services/pocketbase-types'
import GenericTable from './GenericTable'
import { sortByStatus } from '@/services/sort'
import { useEffect } from 'react'
import { throttle } from '@/services/throttle'
import { queryClient } from '@/services/queryClient'

interface Props {
  selectedDate: string
  sprintId: string
  selectedDev?: string | null
}

export default function Investigations(props: Props) {
  const bg = useColorModeValue('white', 'gray.700')
  const { data: investigations = [], isFetching } = useQuery({
    queryKey: [
      props.sprintId,
      Collections.Investigations,
      props.selectedDate,
      props.selectedDev,
    ],
    queryFn: () =>
      pb
        .collection(Collections.Investigations)
        .getFullList<InvestigationsResponse>({
          filter: props.selectedDev
            ? `sprint = '${props.sprintId}' && date = '${props.selectedDate}' && status != 'To Do' && owner = '${props.selectedDev}'`
            : `sprint = '${props.sprintId}' && date = '${props.selectedDate}' && status != 'To Do'`,
          sort: 'status',
        }),
  })

  useEffect(() => {
    pb.collection(Collections.Investigations).subscribe<InvestigationsResponse>(
      '*',
      (e) => {
        const invalidate = throttle(() => {
          queryClient.invalidateQueries({
            queryKey: [
              props.sprintId,
              Collections.Investigations,
              props.selectedDate,
              props.selectedDev,
            ],
          })
        }, 5000)
        if (e.record.sprint === props.sprintId) {
          invalidate()
        }
      }
    )
    return () => {
      pb.collection(Collections.Investigations).unsubscribe('*')
    }
  }, [props.selectedDate, props.sprintId, props.selectedDev])

  investigations.sort(sortByStatus)

  if (isFetching) {
    return (
      <Flex bg="white" boxShadow="md">
        <Skeleton width="100%" height="100px" />
      </Flex>
    )
  }

  return (
    <Flex bg={bg} boxShadow="md" rounded="md" flexDir="column">
      <GenericTable
        rows={investigations}
        headers={['key', 'inv_status', 'owner', 'name', 'status', 'points']}
      />
    </Flex>
  )
}

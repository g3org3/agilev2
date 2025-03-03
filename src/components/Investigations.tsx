import { Flex } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'

import { pb } from '@/services/pb'
import {
  Collections,
  InvestigationsResponse,
} from '@/services/pocketbase-types'
import GenericTable from './GenericTable'
import { sortByStatus } from '@/services/sort'

interface Props {
  selectedDate: string
  sprintId: string
  selectedDev?: string | null
}

export default function Investigations(props: Props) {
  const { data: investigations = [] } = useQuery({
    queryKey: [
      Collections.Investigations,
      props.selectedDate,
      props.sprintId,
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

  investigations.sort(sortByStatus)

  return (
    <Flex bg="white" boxShadow="md" rounded="md" flexDir="column">
      <GenericTable
        rows={investigations}
        headers={['key', 'inv_status', 'owner', 'name', 'status', 'points']}
      />
    </Flex>
  )
}

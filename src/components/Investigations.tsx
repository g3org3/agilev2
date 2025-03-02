/* eslint-disable @typescript-eslint/ban-ts-comment */
import { pb } from '@/services/pb'
import {
  Collections,
  InvestigationsResponse,
} from '@/services/pocketbase-types'
import {
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Link as ChakraLink,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'

interface Props {
  selectedDate: string
  sprintId: string
  selectedDev?: string | null
}

// TODO: move this to its own file as service
function SortFn(ta: { status: string }, tb: { status: string }): number {
  const byStatus: Record<string, number> = {
    'To Do': 0,
    'To Develop': 1,
    'In Progress': 2,
    'In Review': 3,
    'In Test': 4,
    Done: 5,
  }

  const statusa = byStatus[ta.status]
  const statusb = byStatus[tb.status]

  return statusb - statusa
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

  investigations.sort(SortFn)

  return (
    <Flex bg="white" boxShadow="md" rounded="md" flexDir="column">
      <GenericTable
        rows={investigations}
        headers={['key', 'inv_status', 'owner', 'name', 'status', 'points']}
      />
    </Flex>
  )
}

function GenericTable<T>(props: {
  rows: Array<Record<string, T>>
  headers?: Array<string>
}) {
  const headers: string[] = props.headers || Object.keys(props.rows[0])
  return (
    <Table size="sm" rounded="md">
      <Thead bg="purple.600">
        <Tr>
          {headers.map((header) => (
            <Th color="white">{header}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {props.rows.map((row) => {
          return (
            <Tr bg={row.inv_status === 'DONE' ? 'green.100' : 'unset'}>
              {headers.map((field) => {
                return field === 'key' ? (
                  <Td>
                    <ChakraLink
                      target="_blank"
                      href={
                        'https://devopsjira.deutsche-boerse.com/browse/' +
                        row[field]
                      }
                    >
                      <Text color="blue.500" fontWeight="bold">
                        {/* @ts-expect-error */}
                        {row[field]}
                      </Text>
                    </ChakraLink>
                  </Td>
                ) : (
                  //@ts-expect-error
                  <Td>{row[field]}</Td>
                )
              })}
            </Tr>
          )
        })}
        <Tr>
          <Td colSpan={4}></Td>
          <Td borderTop="2px dashed #aaa">total</Td>
          <Td borderTop="2px dashed #aaa">
            {/** @ts-ignore */}
            {props.rows.reduce((accum, x) => x.points + accum, 0)}
          </Td>
        </Tr>
      </Tbody>
    </Table>
  )
}

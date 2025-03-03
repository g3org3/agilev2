import {
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Link as ChakraLink,
} from '@chakra-ui/react'

export default function GenericTable<T>(props: {
  rows: Array<T>
  headers?: Array<string>
  render?: (row: T) => React.ReactNode
}) {
  const headers: string[] = props.headers || Object.keys(props.rows[0] || {})
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
            /* @ts-expect-error */
            <Tr bg={row.inv_status === 'DONE' ? 'green.100' : 'unset'}>
              {headers.map((field) => {
                return field === 'key' ? (
                  <Td>
                    <ChakraLink
                      target="_blank"
                      href={
                        'https://devopsjira.deutsche-boerse.com/browse/' +
                        /* @ts-expect-error */
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

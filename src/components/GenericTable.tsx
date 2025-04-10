import {
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Link as ChakraLink,
  useColorModeValue,
} from '@chakra-ui/react'

export default function GenericTable<T>(props: {
  rows: Array<T>
  headers?: Array<string>
  render?: (row: T) => React.ReactNode
}) {
  const bgGreen = useColorModeValue('green.100', 'green.600')
  const bgBlue = useColorModeValue('blue.500', 'blue.100')
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
            /* @ts-expect-error to fix after */
            <Tr bg={row.inv_status === 'DONE' ? bgGreen : 'unset'}>
              {headers.map((field) => {
                return field === 'key' ? (
                  <Td whiteSpace="nowrap">
                    <ChakraLink
                      target="_blank"
                      href={
                        'https://devopsjira.deutsche-boerse.com/browse/' +
                        /* @ts-expect-error to fix after*/
                        row[field]
                      }
                    >
                      <Text color={bgBlue} fontWeight="bold">
                        {/* @ts-expect-error  to fix after*/}
                        {row[field]}
                      </Text>
                    </ChakraLink>
                  </Td>
                ) : (
                  /* @ts-expect-error kasf */
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
            {/** @ts-expect-error the */}
            {props.rows.reduce((accum, x) => x.points + accum, 0)}
          </Td>
        </Tr>
      </Tbody>
    </Table>
  )
}

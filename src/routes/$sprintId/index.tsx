import { pb } from '@/services/pb'
import {
  Collections,
  SprintDevsViewResponse,
} from '@/services/pocketbase-types'
import { Alert, Button, Code, Flex, useClipboard } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/$sprintId/')({
  component: SprintComponent,
})

function SprintComponent() {
  const { sprintId } = Route.useParams()
  const { onCopy, setValue, value, hasCopied } = useClipboard('')

  const { data: devs = [] } = useQuery({
    queryKey: [sprintId, Collections.SprintDevsView],
    queryFn() {
      return pb
        .collection(Collections.SprintDevsView)
        .getFullList<SprintDevsViewResponse>({
          filter: `sprint='${sprintId}'`,
          sort: 'dev',
        })
    },
  })

  useEffect(() => {
    setValue(devs.map((dev) => dev.dev).join(','))
  }, [devs, setValue])

  return (
    <Flex gap={4} flexDir="column">
      <Flex gap={4}>
        <Code border="1px solid">{value}</Code>
        <Button size="sm" onClick={onCopy}>copy</Button>
      </Flex>
      <Alert opacity={hasCopied? '1' : '0'} transition="all 300ms" status="success">Copy dev names to clipboard!</Alert>
    </Flex>
  )
}

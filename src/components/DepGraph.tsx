import Flow from './FLow'
import { Flex } from '@chakra-ui/react'
import { TicketsResponse } from '@/services/pocketbase-types'
import { useMemo } from 'react'

interface Props {
  tickets?: TicketsResponse[]
  track: string
  selectedDate?: string | null
  isLoading?: boolean
}

// WARN: warning this code is sh**
export default function DepGraph(props: Props) {
  const sgTickets =
    (props.tickets || []).filter((x) => x.epic_name == props.track) || []

  const { edges, n } = useMemo(() => {
    const edges: any[] = []
    const roots: Record<string, any> = {}
    const tree: Record<string, any> = {}
    sgTickets.forEach((x) => {
      const { key, owner, points, status, parents } = x

      if (parents instanceof Array && !!parents?.length) {
        for (let p of parents) {
          edges.push({ id: `ed-${p}-${key}`, source: p, target: key })
        }
      } else {
        roots[key!] = []
      }

      tree[key!] = {
        id: key,
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: key, parents, status, children: [], points, owner },
      }

      return {
        type: 'custom',
        id: key,
        position: { x: 0, y: 0 },
        data: { label: key, parents, status, children: [], points, owner },
      }
    })

    sgTickets.forEach((x) => {
      if (x.parents instanceof Array && !!x.parents?.length) {
        for (let p of x.parents) {
          if (roots[p]) {
            roots[p].push(x.key)
          }
          // console.log({ p, tree })
          tree[p]?.data.children.push(x.key)
        }
      }
    })

    console.group('notes')
    console.log(tree, roots)
    console.groupEnd()

    const n: any[] = []

    const pushChild: (node: any, x: number, y: number) => void = (
      node,
      x,
      y
    ) => {
      node.data.children.forEach((c: any, i: number) => {
        const nn = tree[c]
        nn.position.x = x
        nn.position.y = (y + i) * 120
        n.push(nn)
        if (!!nn.data.children?.length) {
          // console.log('push', nn.id, nn.data.children)
          pushChild(nn, x, y + i + 1)
        }
      })
    }

    Object.keys(roots).forEach((r, i) => {
      const node = tree[r]
      node.position.x = i * 200
      n.push(node)
      pushChild(node, i * 200, 1)
    })

    return { edges, n }
  }, [props.track, props.selectedDate])

  // console.log(tree, roots)

  // { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  // const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

  if (props.isLoading) {
    return null
  }

  return (
    <Flex h="800px" flexDir="column">
      <div className="font-bold text-3xl">{props.track}</div>
      <Flow key={props.track + props.selectedDate} nodes={n} edges={edges} />
    </Flex>
  )
}

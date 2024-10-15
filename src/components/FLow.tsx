// import { useCallback } from 'react';
import ReactFlow, {
  // MiniMap,
  Handle,
  Position,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  // addEdge,
} from 'reactflow'

import 'reactflow/dist/style.css'
import { Flex } from '@chakra-ui/react'

// const initialNodes = [
//   { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
//   { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
// ];

// const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

interface Props {
  id: string
  data: {
    points: number
    status: 'Done' | 'In Test'
    owner: string
    label: string
  }
}

function CustomNode(props: Props) {
  const colorsByStatus = {
    Done: 'green.400',
    'In Test': 'green.200',
    'In Review': 'yellow.400',
    'To Develop': 'orange.400',
    'In Progress': 'orange.500',
    'To Do': 'red.500',
  }
  return (
    <a
      target="_blank"
      href={`https://devopsjira.deutsche-boerse.com/browse/${props.data.label}`}
    >
      <Flex p={3} rounded="md" boxShadow="md" flexDirection="column" bg={colorsByStatus[props.data.status]}>
        <Flex bg="white" rounded="md" justifyContent="center">{props.id}</Flex>
        <p>{props.data.owner}</p>
        <p>{props.data.status}</p>
        <Flex bg="white" rounded="full" alignSelf="flex-start" px={2}>
          {props.data.points}
        </Flex>
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Top} />
      </Flex>
    </a>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

function Flow(props: { nodes: any[]; edges: any[] }) {
  // @ts-ignore
  const [nodes, setNodes, onNodesChange] = useNodesState(props.nodes)
  // @ts-ignore
  const [edges, setEdges, onEdgesChange] = useEdgesState(props.edges)

  // const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
    >
      <Controls />
      <Background />
    </ReactFlow>
  )
}

export default Flow

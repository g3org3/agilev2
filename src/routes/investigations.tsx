import { Flex, Text } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/investigations')({
  component: InvestigationsPage,
})

function InvestigationsPage() {
  return (
    <Flex bg="white">
      <Text>Investigations</Text>
    </Flex>
  )
}

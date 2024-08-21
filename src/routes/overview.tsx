import { pb } from '@/services/pb'
import {
  Collections,
  EpicsResponse,
  RoadmapResponse,
} from '@/services/pocketbase-types'
import { Flex } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/overview')({
  component: Overview,
})

function Overview() {
  const { data: roadmap = [] } = useQuery({
    queryKey: ['get-all', Collections.Roadmap, 'expand-done'],
    queryFn: () =>
      pb.collection(Collections.Roadmap).getFullList<
        RoadmapResponse<{
          done?: EpicsResponse[]
        }>
      >({
        expand: 'done',
      }),
  })

  const byRelease: Record<string, EpicsResponse[]> = {}

  for (const sprint of roadmap) {
    const { release } = sprint
    if (!byRelease[release]) {
      byRelease[release] = []
    }
    if (sprint.expand?.done) {
      const ids = sprint.expand.done.map((d) => d.id)
      const current_without_ids = byRelease[release].filter(
        (d) => !ids.includes(d.id)
      )
      byRelease[release] = Array.from(
        new Set(current_without_ids.concat(sprint.expand.done))
      )
    }
  }

  const releases = Object.keys(byRelease).sort()

  return (
    <>
      <Flex>Overview</Flex>
      <Flex background="white" boxShadow="md">
        {releases.map((release) => (
          <Flex
            p="3"
            gap="3"
            flexDir="column"
            w="300px"
            borderRight="1px solid"
          >
            <Flex fontSize="xl" borderBottom="1px solid" px="2">
              {release}
            </Flex>
            {byRelease[release].map((epic) => (
              <Flex px="4" py="1" background={epic.background} rounded="md">
                {epic.name}
              </Flex>
            ))}
          </Flex>
        ))}
      </Flex>
    </>
  )
}

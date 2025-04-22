/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Avatar, Button, Flex, Input, Text, useColorModeValue } from '@chakra-ui/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import z from 'zod'
import { FormEvent, useMemo, useState } from 'react'
import { Collections, StaffingRecord } from '@/services/pocketbase-types'
import { pb } from '@/services/pb'
import { useMutation } from '@tanstack/react-query'
import { DateTime } from 'luxon'

export const Route = createFileRoute('/$sprintId/admin')({
  component: Admin,
})

function getDates(startAt: string, endAt: string): string[] {
  // should return a list of dates in ISO string from startAt to endAt included.
  const dates: string[] = []
  const currentDate = new Date(startAt)
  while (currentDate <= new Date(endAt)) {
    // should skip if its saturday or sunday
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      currentDate.setDate(currentDate.getDate() + 1)
      continue
    }
    dates.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return dates
}

function onSubmit<T>(schema: z.ZodType<T>, cb: (payload: T) => void) {
  return (e: FormEvent) => {
    e.preventDefault()
    // @ts-ignore
    const data = new FormData(e.target)
    const payload: Record<string, string> = {}
    for (const [key, value] of data) {
      payload[key] = value.toString()
    }
    const safe = schema.parse(payload)

    return cb(safe)
  }
}

async function upsertStaffing(params: { sprint: string; staffing: StaffingRecord[] }) {
  const { sprint, staffing } = params
  const { items } = await pb
    .collection(Collections.Staffing)
    .getList<StaffingRecord>(1, 1, { filter: `sprint = "${sprint}"` })

  if (items.length == 1) {
    return
  }

  const result = await Promise.allSettled(
    staffing.map((staff) => pb.collection(Collections.Staffing).create(staff))
  )
  return result
}

function Admin() {
  const bg = useColorModeValue('white', 'gray.700')
  const { sprintId } = Route.useParams()
  const [devs, setDevs] = useState<string[]>([])
  const [startAt, setStartAt] = useState<string>('')
  const [endAt, setEndAt] = useState<string>('')
  const navigate = useNavigate()

  const { mutate, isPending } = useMutation({
    mutationFn: (staffing: StaffingRecord[]) => upsertStaffing({ sprint: sprintId, staffing }),
    onSuccess() {
      navigate({ to: '/$sprintId/staffing', params: { sprintId } })
    }
  })

  const onDevSubmit = onSubmit(z.object({ devs: z.string() }), (data) => {
    setDevs(data.devs.split(',').map(x => x.trim()))
  })

  const onDateSubmit = onSubmit(z.object({ startAt: z.string(), endAt: z.string() }), (data) => {
    setStartAt(data.startAt)
    setEndAt(data.endAt)
  })

  const onCreateStaffing = () => {
    const staffing = days
      .map((day, index, items) =>
        devs.map((dev) => ({
          sprint: sprintId,
          dev,
          points: ["Frederic Mamath", "Manuel David Camargo Rivera EXT"].includes(dev) ? (index === 0 || index === items.length - 1) ? 1 : 2 : index === 0 ? 2 : 5,
          utc_date: `${day} 00:00:00.000Z`,
          date: day,
        }))
      )
      .flat() satisfies StaffingRecord[]
    mutate(staffing)
  }

  const days = useMemo(() => {
    return getDates(startAt, endAt)
  }, [startAt, endAt])

  return (
    <Flex flexDir="column" bg={bg} boxShadow="md" p="5" gap={4}>
      <Text fontSize="3xl">Creating new Sprint - {sprintId}</Text>
      <form onSubmit={onDevSubmit}>
        <Flex gap={2}>
          <Input
            disabled={isPending}
            placeholder="dev's name"
            name="devs"
          />
          <Button disabled={isPending} type="submit">
            create
          </Button>
        </Flex>
      </form>
      <form onSubmit={onDateSubmit}>
        <Flex gap={2}>
          <Input w="300px" disabled={isPending} className="dark:bg-slate-700 p-2" name="startAt" type="date" />
          <Input w="300px" disabled={isPending} className="dark:bg-slate-700 p-2" name="endAt" type="date" />
          <Button disabled={isPending} type="submit">
            update dates
          </Button>
        </Flex>
      </form>
      {startAt && endAt && (
        <h2>
          devs from {startAt} to {endAt}
        </h2>
      )}
      {devs.length > 0 && (
        <>
          <Text fontSize="2xl">Devs</Text>
          <Flex flexDir="column" gap={2}>
            {devs.map((dev) => (
              <Flex key={dev} alignItems="center" gap={3}>
                <Avatar name={dev} size="sm" />
                {dev}
              </Flex>
            ))}
          </Flex>
        </>
      )}
      {days.length > 0 && (
        <>
          <Text fontSize="2xl">Days</Text>
          <Flex flexDir="column" fontFamily="mono">
            {days.map((day) => (
              <Flex key={'day-' + day} gap={7}>
                <Flex>{DateTime.fromSQL(`${day} 00:00:00.000Z`).toFormat("EEE LLL dd")}</Flex>
                <Flex gap={4}>
                  {devs.map((dev) => (
                    <Flex borderLeft="1px solid" borderColor="gray.400" pl={3} key={'d-' + dev}>{dev.split(' ')[0]}</Flex>
                  ))}
                </Flex>
              </Flex>
            ))}
          </Flex>
        </>
      )}
      <Button
        isDisabled={isPending || devs.length === 0 || startAt === '' || endAt === ''}
        onClick={onCreateStaffing}
      >
        {isPending ? 'loading...' : 'create staffing'}
      </Button>
    </Flex>
  )
}

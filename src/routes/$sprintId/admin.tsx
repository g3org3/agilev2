import { Button, Flex, Input } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import { FormEvent, useMemo, useState } from 'react'
import { Collections, StaffingRecord } from '@/services/pocketbase-types'
import { pb } from '@/services/pb'
import { useMutation } from '@tanstack/react-query'

export const Route = createFileRoute('/$sprintId/admin')({
  component: Admin,
})

function getDates(startAt: string, endAt: string): string[] {
  // should return a list of dates in ISO string from startAt to endAt included.
  const dates: string[] = []
  let currentDate = new Date(startAt)
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
    for (let [key, value] of data) {
      payload[key] = value.toString()
    }
    const safe = schema.parse(payload)

    return cb(safe)
  }
}

export async function upsertStaffing(params: { sprint: string; staffing: StaffingRecord[] }) {
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
  const { sprintId } = Route.useParams()
  const [devs, setDevs] = useState<string[]>([])
  const [startAt, setStartAt] = useState<string>('')
  const [endAt, setEndAt] = useState<string>('')

  const { mutate, isPending } = useMutation({
    mutationFn: (staffing: StaffingRecord[]) => upsertStaffing({ sprint: sprintId, staffing }),
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
      .map((day) =>
        devs.map((dev) => ({
          sprint: sprintId,
          dev,
          points: 5,
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
    <Flex flexDir="column" bg="white" boxShadow="md" p="5" w="800px" margin="0 auto" gap={4}>
      <h1>AdminStaff</h1>
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
      <h3 className="text-2xl">Devs</h3>
      <ul>
        {devs.map((dev) => (
          <li>{dev}</li>
        ))}
      </ul>
      <h2 className="text-2xl">Days</h2>
      <Flex flexDir="column">
        {days.map((day) => (
          <Flex gap={7}>
            <div>{day}</div>
            <Flex gap={4}>
              {devs.map((dev) => (
                <div>{dev}</div>
              ))}
            </Flex>
          </Flex>
        ))}
      </Flex>
      <Button
        disabled={isPending || !devs || !startAt || !endAt}
        onClick={onCreateStaffing}
      >
        {isPending ? 'loading...' : 'create staffing'}
      </Button>
    </Flex>
  )
}

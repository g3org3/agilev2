import { DateTime } from "luxon";

export function getNextDate(iso_date_str?: string | null) {
  if (!iso_date_str) return null

  const date = DateTime.fromISO(`${iso_date_str}T00:00:00.000Z`)

  return date.plus({ day: 1 }).toUTC().toFormat('yyyy-MM-dd')
}

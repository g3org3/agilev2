export function sortByStatus(
  ta: { status: string },
  tb: { status: string }
): number {
  const byStatus: Record<string, number> = {
    'To Do': 0,
    'To Develop': 1,
    'In Progress': 2,
    'In Review': 3,
    'In Test': 4,
    Done: 5,
  }

  const statusa = byStatus[ta.status]
  const statusb = byStatus[tb.status]

  return statusb - statusa
}

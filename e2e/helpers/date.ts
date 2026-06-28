export function getMinDateString(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

export function getMaxDateString(): string {
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 14)
  return maxDate.toISOString().split('T')[0]
}

export function getTomorrowDateString(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

export function addDays(dateStr: string, days: number): Date {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date
}

export function getSlotStartTime(dateStr: string, hour: number, minute: number = 0): string {
  const date = new Date(dateStr)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}
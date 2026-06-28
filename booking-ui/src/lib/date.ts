import { parseISO, format, isValid, addDays } from 'date-fns'

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours} hr`
  }
  return `${hours} hr ${mins} min`
}

export function formatDateTime(isoString: string): string {
  let date = parseISO(isoString)

  if (!isValid(date)) {
    date = new Date(isoString)
  }

  if (!isValid(date)) {
    return 'Invalid time'
  }

  return format(date, 'MMM d, h:mm a')
}

export function formatDate(isoString: string): string {
  const date = parseISO(isoString)
  if (!isValid(date)) {
    return 'Invalid date'
  }
  return format(date, 'EEEE, MMMM d, yyyy')
}

export const MAX_BOOKING_DAYS = 14

export function getMinDateString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getMaxDateString(): string {
  return format(addDays(new Date(), MAX_BOOKING_DAYS), 'yyyy-MM-dd')
}
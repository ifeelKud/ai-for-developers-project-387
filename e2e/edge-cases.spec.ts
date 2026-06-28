import { test, expect } from '@playwright/test'
import { api } from './helpers/api'
import { getTomorrowDateString, getSlotStartTime } from './helpers/date'

test.describe('Edge Cases', () => {
  let eventTypeId: string

  test.beforeEach(async () => {
    const eventType = await api.createEventType('Test Event', 'Test description', 30)
    eventTypeId = eventType.id
  })

  test('double booking the same slot returns 409', async () => {
    const tomorrow = getTomorrowDateString()
    const slotTime = getSlotStartTime(tomorrow, 14, 0)

    const first = await api.createBooking(eventTypeId, slotTime, 'User One', 'one@example.com')
    expect((first as any).status).toBe(201)

    const second = await api.createBooking(eventTypeId, slotTime, 'User Two', 'two@example.com')
    expect((second as any).status).toBe(409)
    expect((second as any).data).toHaveProperty('code', 'SLOT_OCCUPIED')
  })

  test('booking slot outside 14-day window returns 400', async () => {
    const day15 = new Date()
    day15.setDate(day15.getDate() + 15)
    const slotOutsideWindow = day15.toISOString()

    const result = await api.createBooking(eventTypeId, slotOutsideWindow, 'User', 'user@example.com')
    expect((result as any).status).toBe(400)
    expect((result as any).data).toHaveProperty('code', 'SLOT_OUTSIDE_WINDOW')
  })

  test('booking with empty guestName returns 400', async () => {
    const tomorrow = getTomorrowDateString()
    const slotTime = getSlotStartTime(tomorrow, 9, 0)

    const result = await api.createBooking(eventTypeId, slotTime, '', 'user@example.com')
    expect((result as any).status).toBe(400)
    expect((result as any).data).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  test('booking with non-existent eventTypeId returns 404', async () => {
    const tomorrow = getTomorrowDateString()
    const slotTime = getSlotStartTime(tomorrow, 10, 0)

    const result = await api.createBooking('00000000-0000-0000-0000-000000000000', slotTime, 'User', 'user@example.com')
    expect((result as any).status).toBe(404)
    expect((result as any).data).toHaveProperty('code', 'NOT_FOUND')
  })

  test('cancelling already cancelled booking returns 400', async () => {
    const tomorrow = getTomorrowDateString()
    const slotTime = getSlotStartTime(tomorrow, 13, 0)

    const booking = await api.createBooking(eventTypeId, slotTime, 'User', 'user@example.com') as any

    await api.cancelBooking(booking.data.id, 'First cancel')
    const secondCancel = await api.cancelBooking(booking.data.id, 'Second cancel')

    expect(secondCancel.status).toBe(400)
    expect(secondCancel.data).toHaveProperty('code', 'VALIDATION_ERROR')
    expect((secondCancel.data as any).message).toContain('already cancelled')
  })
})
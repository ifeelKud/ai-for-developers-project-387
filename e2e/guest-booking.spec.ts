import { test, expect } from '@playwright/test'
import { api } from './helpers/api'
import { getTomorrowDateString, getSlotStartTime } from './helpers/date'

test.describe('Guest Booking Flow', () => {
  let eventTypeId: string

  test.beforeEach(async () => {
    const eventType = await api.createEventType('Consultation', '30 minute consultation', 30)
    eventTypeId = eventType.id
  })

  test('complete booking flow: create -> view -> cancel', async ({ page }) => {
    const tomorrow = getTomorrowDateString()

    await page.goto(`/events/${eventTypeId}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Consultation' })).toBeVisible({ timeout: 15000 })

    await page.locator('input[type="date"]').fill(tomorrow)

    await page.waitForSelector('.grid button:not([disabled])', { timeout: 5000 })
    const firstAvailableSlot = page.locator('.grid button:not([disabled])').first()
    await firstAvailableSlot.click()

    await expect(page.getByLabel('Name')).toBeVisible()
    await page.getByLabel('Name').fill('Ivan Ivanov')
    await page.getByLabel('Email').fill('ivan@example.com')

    await page.getByRole('button', { name: 'Confirm Booking' }).click()

    await expect(page).toHaveURL(/\/bookings\/./, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Booking #')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Confirmed')).toBeVisible()
    await expect(page.getByText('Ivan Ivanov')).toBeVisible()
    await expect(page.getByText('ivan@example.com')).toBeVisible()
  })

  test('cancel booking restores slot availability', async ({ page }) => {
    const tomorrow = getTomorrowDateString()
    const slotTime = getSlotStartTime(tomorrow, 11, 0)

    const booking = await api.createBooking(eventTypeId, slotTime, 'Test User', 'test@example.com') as any

    await page.goto(`/bookings/${booking.data.id}`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: 'Cancel Booking' })).toBeVisible({ timeout: 15000 })
    await page.getByRole('button', { name: 'Cancel Booking' }).click()

    await expect(page.getByText('Cancelled')).toBeVisible()

    await page.goto(`/events/${eventTypeId}`)
    await page.locator('input[type="date"]').fill(tomorrow)

    await page.waitForSelector('.grid button:not([disabled])', { timeout: 5000 })
    const slotButton = page.locator('.grid button:not([disabled])').first()
    await expect(slotButton).toBeVisible()
  })
})
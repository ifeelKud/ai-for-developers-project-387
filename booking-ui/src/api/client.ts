import createClient from 'openapi-fetch'
import type { paths, components } from './types'

export type EventType = components['schemas']['EventType']
export type Booking = components['schemas']['Booking']
export type Slot = components['schemas']['Slot']
export type BookingStatus = components['schemas']['BookingStatus']

export type CreateBookingRequest = components['schemas']['CreateBookingRequest']
export type CancelBookingRequest = components['schemas']['CancelBookingRequest']
export type CreateEventTypeRequest = components['schemas']['CreateEventTypeRequest']
export type UpdateEventTypeRequest = components['schemas']['UpdateEventTypeRequest']
export type ErrorResponse = components['schemas']['ErrorResponse']

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
})

export const publicEvents = {
  list: () => apiClient.GET('/api/events'),
  get: (id: string) => apiClient.GET('/api/events/{id}' as const, { params: { path: { id } } }),
  getSlots: (id: string, from: string, to: string) =>
    apiClient.GET('/api/events/{id}/slots' as const, { params: { path: { id }, query: { from, to } } }),
}

export const publicBookings = {
  create: (data: CreateBookingRequest) =>
    apiClient.POST('/api/bookings', { body: data }),
  get: (id: string) => apiClient.GET('/api/bookings/{id}' as const, { params: { path: { id } } }),
  cancel: (id: string, data: CancelBookingRequest) =>
    apiClient.POST('/api/bookings/{id}/cancel' as const, { params: { path: { id } }, body: data }),
}

export const adminBookings = {
  list: () => apiClient.GET('/api/admin/bookings'),
  cancel: (id: string, data: CancelBookingRequest) =>
    apiClient.POST('/api/admin/bookings/{id}/cancel' as const, { params: { path: { id } }, body: data }),
}

export const adminEventTypes = {
  list: () => apiClient.GET('/api/admin/event-types'),
  create: (data: CreateEventTypeRequest) =>
    apiClient.POST('/api/admin/event-types', { body: data }),
  update: (id: string, data: UpdateEventTypeRequest) =>
    apiClient.PUT('/api/admin/event-types/{id}' as const, { params: { path: { id } }, body: data }),
  delete: (id: string) =>
    apiClient.DELETE('/api/admin/event-types/{id}' as const, { params: { path: { id } } }),
}
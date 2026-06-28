// ============================================================
// IMPORTS
// ============================================================
import "@typespec/http";
import "@typespec/rest";

using Http;
using Rest;

// ============================================================
// SERVICE DEFINITION
// ============================================================
@service(#{
  title: "Booking Service"
})
@server("http://localhost:3000", "Local development server")
namespace BookingService;

// ============================================================
// ENUMS
// ============================================================

enum BookingStatus {
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
}

// ============================================================
// MODELS (Domain Entities)
// ============================================================

model EventType {
  id: string;
  @minLength(1) @maxLength(200) name: string;
  @maxLength(2000) description: string | null;
  @minValue(1) durationMinutes: int32;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

model Booking {
  id: string;
  eventTypeId: string;
  slotStartTime: string;
  slotEndTime: string;
  @minLength(1) guestName: string;
  @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$") guestEmail: string;
  status: BookingStatus;
  createdAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
}

model Slot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// ============================================================
// REQUEST/RESPONSE MODELS (DTOs)
// ============================================================

model CreateBookingRequest {
  eventTypeId: string;
  slotStartTime: string;
  @minLength(1) guestName: string;
  @pattern("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$") guestEmail: string;
}

model CancelBookingRequest {
  cancelReason: string | null;
}

model CreateEventTypeRequest {
  @minLength(1) @maxLength(200) name: string;
  @maxLength(2000) description: string | null;
  @minValue(1) durationMinutes: int32;
}

model UpdateEventTypeRequest {
  @minLength(1) @maxLength(200) name: string;
  @maxLength(2000) description: string | null;
  @minValue(1) durationMinutes: int32;
  isActive: boolean;
}

model ErrorResponse {
  code: string;
  message: string;
  details: string | null;
}

// ============================================================
// PUBLIC API (Guest-facing)
// ============================================================

@tag("Events")
interface PublicEvents {
  @route("/api/events")
  @get listEventTypes(): EventType[];

  @route("/api/events/{id}")
  @get getEventType(@path id: string): EventType | ErrorResponse;

  @route("/api/events/{id}/slots")
  @get getSlots(
    @path id: string,
    @query from: string,
    @query to: string
  ): Slot[] | ErrorResponse;
}

@tag("Bookings")
interface PublicBookings {
  @route("/api/bookings")
  @post createBooking(@body request: CreateBookingRequest): {
    @statusCode statusCode: 201;
    @body booking: Booking;
  } | ErrorResponse;

  @route("/api/bookings/{id}")
  @get getBooking(@path id: string): Booking | ErrorResponse;

  @route("/api/bookings/{id}/cancel")
  @post cancelBooking(
    @path id: string,
    @body request: CancelBookingRequest
  ): {
    @statusCode statusCode: 200;
    @body booking: Booking;
  } | ErrorResponse;
}

// ============================================================
// ADMIN API (Owner-facing)
// ============================================================

@tag("Admin - Bookings")
interface AdminBookings {
  @route("/api/admin/bookings")
  @get listUpcomingBookings(): Booking[];

  @route("/api/admin/bookings/{id}/cancel")
  @post cancelBooking(
    @path id: string,
    @body request: CancelBookingRequest
  ): {
    @statusCode statusCode: 200;
    @body booking: Booking;
  } | ErrorResponse;
}

@tag("Admin - Event Types")
interface AdminEventTypes {
  @route("/api/admin/event-types")
  @get listEventTypes(): EventType[];

  @route("/api/admin/event-types")
  @post createEventType(@body request: CreateEventTypeRequest): {
    @statusCode statusCode: 201;
    @body eventType: EventType;
  } | ErrorResponse;

  @route("/api/admin/event-types/{id}")
  @put updateEventType(
    @path id: string,
    @body request: UpdateEventTypeRequest
  ): EventType | ErrorResponse;

  @route("/api/admin/event-types/{id}")
  @delete deleteEventType(@path id: string): {
    @statusCode statusCode: 204;
  } | ErrorResponse;
}
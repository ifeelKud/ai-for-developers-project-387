export interface ErrorResponse {
  code: string;
  message: string;
  details: string | null;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details: string | null = null
  ) {
    super(message);
  }

  toJSON(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export const errors = {
  notFound: (resource: string, id: string) =>
    new AppError(404, 'NOT_FOUND', `${resource} not found`, `id: ${id}`),

  validation: (message: string, details?: string) =>
    new AppError(400, 'VALIDATION_ERROR', message, details ?? null),

  slotOutsideWindow: (message: string) =>
    new AppError(400, 'SLOT_OUTSIDE_WINDOW', message, 'Slots must be within 14 days from now'),

  slotOccupied: () =>
    new AppError(409, 'SLOT_OCCUPIED', 'Selected time slot is already booked', null),

  invalidEmail: () =>
    new AppError(400, 'INVALID_EMAIL', 'Invalid email format', 'Must match pattern: ^[^\s@]+@[^\s@]+\.[^\s@]+$'),

  invalidDate: (message: string) =>
    new AppError(400, 'INVALID_DATE', message, null),
};
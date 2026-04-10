import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract a human-readable error message from API error responses.
 * Handles various error shapes from the backend:
 * - { message: "..." }
 * - { error: "..." }
 * - { errors: ["...", "..."] }
 * - { errors: [{ message: "..." }] }
 * - { status: 400, message: "..." }
 * - Standard Error instances
 * - Unknown errors
 *
 * @param error - The caught error object
 * @param fallback - Optional fallback message
 * @returns A user-friendly error message string
 */
export function extractErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (!error) return fallback;

  // Handle standard Error instances
  if (error instanceof Error) {
    return error.message || fallback;
  }

  // Handle API error objects (thrown by api.service.ts)
  if (typeof error === 'object') {
    const err = error as Record<string, unknown>;

    // { message: "..." } — most common from our BE
    if (typeof err.message === 'string' && err.message.trim()) {
      return err.message;
    }

    // { error: { message: "..." } } — format from our BE on 400/403/404
    if (typeof err.error === 'object' && err.error !== null) {
      const nested = err.error as Record<string, unknown>;
      if (typeof nested.message === 'string' && nested.message.trim()) {
        return nested.message;
      }
    }

    // { error: "..." }
    if (typeof err.error === 'string' && err.error.trim()) {
      return err.error;
    }

    // { errors: [...] } — validation errors
    if (Array.isArray(err.errors) && err.errors.length > 0) {
      const messages = err.errors.map((e: unknown) => {
        if (typeof e === 'string') return e;
        if (typeof e === 'object' && e !== null && 'message' in e) return (e as { message: string }).message;
        return String(e);
      });
      return messages.join('. ');
    }

    // { statusText: "..." }
    if (typeof err.statusText === 'string' && err.statusText.trim()) {
      return err.statusText;
    }
  }

  // Handle string errors
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallback;
}

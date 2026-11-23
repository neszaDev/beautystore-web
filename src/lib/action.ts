import "server-only";
import { ApiError } from "./api";

/**
 * Result envelope returned by every Server Action (redirects aside). The browser maps `code`
 * to localized copy with errorMessage() from src/i18n; the API is authoritative for validation.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; code: string; fieldErrors?: Record<string, string>; details?: Record<string, unknown> };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });

/** Wrap an action body: ApiError -> {ok:false}. Anything else (redirect/notFound signals, bugs) is re-thrown. */
export async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof ApiError) {
      return {
        ok: false,
        code: e.code,
        fieldErrors: e.fieldErrors ?? undefined,
        details: e.details ?? undefined,
      };
    }
    throw e;
  }
}

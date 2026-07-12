/**
 * reportError — single funnel for non-fatal async/DB failures.
 *
 * The app has many `try/catch` blocks around SQLite/async work; before this,
 * almost all of them swallowed errors with a bare `console.error`, leaving the
 * user with a silent empty/broken screen. `reportError` always logs (so CI and
 * the dev console still see the detail) AND surfaces a non-blocking toast via
 * the registered ToastProvider callback, so failures become visible.
 */

type ErrorReporter = (message: string) => void;

let reporter: ErrorReporter | null = null;

/** Called by ToastProvider on mount so reportError can reach the UI. */
export function registerErrorReporter(fn: ErrorReporter | null): void {
  reporter = fn;
}

export function reportError(error: unknown, context?: string): void {
  const message = error instanceof Error ? error.message : String(error);
  const full = context ? `${context}: ${message}` : message;
  console.error(full, error);
  reporter?.(full);
}

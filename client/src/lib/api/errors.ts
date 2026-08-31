/**
 * One error type for the whole console.
 *
 * The backend has no single error envelope — most errors are a bare
 * `{ message }` with no `success` flag, some are `{ success, message }`, some
 * carry `errors: [{ field, message, value }]`, and express-validator sometimes
 * returns a raw `{ errors: [...] }`. Every page does `toast.error(err.message)`,
 * so normalising to something always readable is what matters.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, opts: { code?: string; fieldErrors?: Record<string, string> } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = opts.code;
    this.fieldErrors = opts.fieldErrors;
  }
}

export const isUnauthorized = (e: unknown) => e instanceof ApiError && e.status === 401;
export const isForbidden = (e: unknown) => e instanceof ApiError && e.status === 403;

/** Note: the backend's ValidationError is 422, not 400. */
const STATUS_FALLBACK: Record<number, string> = {
  400: "Invalid request.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to do that.",
  404: "Not found.",
  409: "That already exists.",
  413: "That file is too large.",
  422: "Please check the highlighted fields.",
  429: "Too many requests. Please wait a moment and try again.",
};

const MAX_MESSAGE = 300;

const collectFieldErrors = (errors: unknown): Record<string, string> | undefined => {
  if (!Array.isArray(errors)) return undefined;
  const out: Record<string, string> = {};
  for (const e of errors) {
    if (e && typeof e === "object") {
      const field = (e as any).field ?? (e as any).param ?? (e as any).path;
      const msg = (e as any).message ?? (e as any).msg;
      if (field && msg) out[String(field)] = String(msg);
    }
  }
  return Object.keys(out).length ? out : undefined;
};

const extractMessage = (body: any, status: number): string => {
  if (body && typeof body === "object") {
    if (typeof body.message === "string" && body.message.trim()) return body.message;
    if (typeof body.error === "string" && body.error.trim()) return body.error;

    if (Array.isArray(body.errors)) {
      const parts = body.errors
        .map((e: any) => (typeof e === "string" ? e : e?.message ?? e?.msg))
        .filter(Boolean)
        .slice(0, 3);
      if (parts.length) return parts.join("; ");
    }
    if (typeof body.data?.message === "string" && body.data.message.trim()) return body.data.message;
  }
  if (typeof body === "string" && body.trim() && !body.trim().startsWith("<")) return body;
  return STATUS_FALLBACK[status] ?? "Something went wrong. Please try again.";
};

export const normalizeError = (status: number, body: unknown): ApiError => {
  const message = extractMessage(body, status).slice(0, MAX_MESSAGE);
  const code = body && typeof body === "object" ? (body as any).code : undefined;
  const fieldErrors = body && typeof body === "object" ? collectFieldErrors((body as any).errors) : undefined;
  // `stack` is injected into error bodies when the API runs with
  // NODE_ENV=development — it must never reach a toast.
  return new ApiError(status, message, { code, fieldErrors });
};

export const networkError = () => new ApiError(0, "Cannot reach the server. Check your connection.");

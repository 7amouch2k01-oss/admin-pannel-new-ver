/**
 * Facade primitives.
 *
 * The pages were written against tRPC's hook surface
 * (`x.y.useQuery()`, `x.y.useMutation()`, `useUtils()`). Rather than rewrite
 * ~40 call sites across working UI, `q()` and `m()` reproduce that surface on
 * top of TanStack Query.
 *
 * Parity is structural, not emulated: options are spread through and the
 * TanStack result is returned untouched, so `isLoading` / `isPending` / `error`
 * / `refetch` / `onSuccess` / `onError` behave exactly as they always did.
 *
 * Escape hatch: every node exposes `queryKey()` and `fetch()`, so anything the
 * facade does not cover (infinite queries, optimistic updates, prefetching)
 * drops to raw TanStack Query instead of growing this file.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import type { ApiError } from "./errors";

export type QueryOpts<TOut> = Omit<UseQueryOptions<TOut, ApiError>, "queryKey" | "queryFn">;
export type MutOpts<TOut, TIn> = Omit<UseMutationOptions<TOut, ApiError, TIn>, "mutationFn">;

export type QueryNode<TIn, TOut> = {
  useQuery(input?: TIn, opts?: QueryOpts<TOut>): UseQueryResult<TOut, ApiError>;
  queryKey(input?: TIn): QueryKey;
  fetch(input?: TIn): Promise<TOut>;
  readonly _path: readonly string[];
  readonly _kind: "query";
};

export type MutationNode<TIn, TOut> = {
  useMutation(opts?: MutOpts<TOut, TIn>): UseMutationResult<TOut, ApiError, TIn>;
  readonly _path: readonly string[];
  readonly _kind: "mutation";
};

/**
 * `[...path, input ?? null]` — prefix-matchable, so invalidating by path alone
 * covers every input variant, which is what `utils.x.y.invalidate()` needs.
 */
const keyFor = (path: readonly string[], input: unknown): QueryKey => [
  ...path,
  input === undefined ? null : input,
];

export function q<TIn, TOut>(
  path: string[],
  run: (input: TIn) => Promise<TOut>
): QueryNode<TIn, TOut> {
  return {
    _path: path,
    _kind: "query",
    queryKey: (input?: TIn) => keyFor(path, input),
    fetch: (input?: TIn) => run(input as TIn),
    useQuery: (input?: TIn, opts?: QueryOpts<TOut>) =>
      useQuery<TOut, ApiError>({
        queryKey: keyFor(path, input),
        queryFn: () => run(input as TIn),
        ...opts,
      }),
  };
}

export function m<TIn, TOut>(
  path: string[],
  run: (input: TIn) => Promise<TOut>
): MutationNode<TIn, TOut> {
  return {
    _path: path,
    _kind: "mutation",
    useMutation: (opts?: MutOpts<TOut, TIn>) =>
      useMutation<TOut, ApiError, TIn>({ mutationFn: run, ...opts }),
  };
}

// ── useUtils ─────────────────────────────────────────────────────────────────

export type QueryUtils<TIn, TOut> = {
  invalidate(input?: TIn): Promise<void>;
  setData(input: TIn | undefined, data: TOut | null): void;
  getData(input?: TIn): TOut | undefined;
  refetch(input?: TIn): Promise<void>;
  cancel(input?: TIn): Promise<void>;
  reset(input?: TIn): Promise<void>;
};

const isNode = (v: any) => v && typeof v === "object" && "_kind" in v;

const utilsForNode = (client: QueryClient, node: QueryNode<any, any>): QueryUtils<any, any> => {
  // No input -> match the whole procedure by prefix; with input -> that key only.
  const scope = (input: unknown) =>
    input === undefined
      ? { queryKey: [...node._path] }
      : { queryKey: keyFor(node._path, input), exact: true as const };

  return {
    invalidate: (input?: unknown) => client.invalidateQueries(scope(input)),
    // Argument order matters: setData(input, data) — `auth.me.setData(undefined, null)`.
    setData: (input: unknown, data: unknown) => {
      client.setQueryData(keyFor(node._path, input), data);
    },
    getData: (input?: unknown) => client.getQueryData(keyFor(node._path, input)),
    refetch: (input?: unknown) => client.refetchQueries(scope(input)),
    cancel: (input?: unknown) => client.cancelQueries(scope(input)),
    reset: (input?: unknown) => client.resetQueries(scope(input)),
  };
};

const buildUtils = (client: QueryClient, tree: any): any => {
  const out: any = {};
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === "function") continue; // useUtils itself
    if (isNode(value)) {
      if ((value as any)._kind === "query") out[key] = utilsForNode(client, value as QueryNode<any, any>);
      continue; // mutations have no cache entries
    }
    if (value && typeof value === "object") out[key] = buildUtils(client, value);
  }
  return out;
};

/** Memoized on the QueryClient — `useAuth` puts the result in a dep array. */
export const makeUseUtils = <T>(tree: T) => {
  return function useUtils(): any {
    const client = useQueryClient();
    return useMemo(() => buildUtils(client, tree), [client]);
  };
};

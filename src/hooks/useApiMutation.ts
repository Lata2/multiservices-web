import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { ApiError } from '@/services/http';
import { toast } from '@/store/toast.store';

interface Options<TData, TVars> {
  /** Query key prefixes to invalidate on success. */
  invalidate?: QueryKey[];
  successMessage?: string | ((data: TData, vars: TVars) => string);
  /** Suppress the automatic error toast (e.g. when the form shows field errors). */
  silentError?: boolean;
  onSuccess?: (data: TData, vars: TVars) => void;
  onError?: (err: ApiError) => void;
}

/**
 * Thin wrapper over `useMutation` that standardises cache invalidation,
 * success toasts and error toasts for every write in the app.
 */
export function useApiMutation<TData, TVars = void>(fn: (vars: TVars) => Promise<TData>, opts: Options<TData, TVars> = {}) {
  const qc = useQueryClient();
  return useMutation<TData, ApiError, TVars>({
    mutationFn: fn,
    onSuccess: async (data, vars) => {
      await Promise.all((opts.invalidate ?? []).map((queryKey) => qc.invalidateQueries({ queryKey })));
      if (opts.successMessage) toast.success(typeof opts.successMessage === 'function' ? opts.successMessage(data, vars) : opts.successMessage);
      opts.onSuccess?.(data, vars);
    },
    onError: (err) => {
      if (!opts.silentError) toast.error(err?.message ?? 'Something went wrong');
      opts.onError?.(err);
    },
  });
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

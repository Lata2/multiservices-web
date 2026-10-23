/**
 * Imperative navigation usable outside React (mutation callbacks, the global 401 handler).
 * `router.tsx` wires this to the data router once it is created.
 */
type NavigateFn = (to: string, opts?: { replace?: boolean }) => void;

let impl: NavigateFn = (to, opts) => (opts?.replace ? window.location.replace(to) : window.location.assign(to));

export const navigation = {
  set(fn: NavigateFn) {
    impl = fn;
  },
  navigate(to: string, opts?: { replace?: boolean }) {
    impl(to, opts);
  },
};

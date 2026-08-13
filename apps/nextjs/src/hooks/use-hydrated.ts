import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => undefined;

/**
 * Returns false during SSR and the initial hydration render, true afterwards.
 * Use to gate client-only reads (e.g. localStorage) without the
 * setState-in-effect pattern that the React Compiler flags.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

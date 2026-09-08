import * as Updates from "expo-updates";
import { useEffect } from "react";

/**
 * Applies an EAS Update the moment it finishes downloading. expo-updates
 * checks on every cold start (checkAutomatically defaults to ON_LOAD) and
 * would otherwise hold the downloaded bundle until the next launch.
 *
 * No-op in development and in builds without an update URL, where
 * `Updates.isEnabled` is false and `useUpdates` never reports a pending
 * update.
 */
export function useOtaUpdates() {
  const { isUpdatePending } = Updates.useUpdates();

  useEffect(() => {
    if (!isUpdatePending) {
      return;
    }
    const reload = async () => {
      try {
        await Updates.reloadAsync();
      } catch {
        // A failed reload keeps the current bundle; the update still applies
        // on the next cold start.
      }
    };
    reload();
  }, [isUpdatePending]);
}

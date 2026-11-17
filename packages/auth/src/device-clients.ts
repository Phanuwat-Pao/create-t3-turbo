/**
 * Device clients this app accepts, mapped to names users recognize.
 *
 * `validateClient` in initAuth rejects any other `client_id` at
 * `/device/code` and `/device/token`, so the approval page can show these
 * names instead of the raw ID the device sent. Replace the example with your
 * own CLI or TV app before shipping one.
 */
export const deviceClients: ReadonlyMap<string, string> = new Map([
  ["acme-cli", "Acme CLI"],
]);

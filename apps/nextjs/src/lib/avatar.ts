/**
 * Returns the avatar URL for a given user ID.
 * Resolves S3 keys, OAuth URLs, and legacy base64 via the `/api/avatar` route.
 */
export function getAvatarUrl(userId: string): string {
  return `/api/avatar/${encodeURIComponent(userId)}`;
}

/**
 * Returns the logo URL for a given organization ID.
 * Resolves S3 keys and legacy formats via the `/api/org-logo` route.
 */
export function getOrgLogoUrl(orgId: string): string {
  return `/api/org-logo/${encodeURIComponent(orgId)}`;
}

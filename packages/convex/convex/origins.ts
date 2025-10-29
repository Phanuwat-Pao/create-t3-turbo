const siteUrl = process.env.SITE_URL;
const convexUrl = process.env.CONVEX_URL;
const convexSiteUrl = process.env.CONVEX_SITE_URL;
const expoUrl = process.env.EXPO_URL;
const allowedOrigins: string[] = [];
if (siteUrl) {
  allowedOrigins.push(siteUrl);
}
if (convexUrl) {
  allowedOrigins.push(convexUrl);
}
if (convexSiteUrl) {
  allowedOrigins.push(convexSiteUrl);
}
if (expoUrl) {
  allowedOrigins.push(expoUrl);
}
export { allowedOrigins };

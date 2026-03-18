/**
 * Check that the request includes valid admin Basic Auth credentials.
 * When ADMIN_SECRET is not set (local dev), all requests are allowed.
 */
export function isAdminAuthenticated(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const password = decoded.slice(decoded.indexOf(":") + 1);
    return password === secret;
  }

  return false;
}

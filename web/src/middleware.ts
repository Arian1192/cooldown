import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;

  // If no secret is configured, allow access (useful for local dev without auth)
  if (!adminSecret) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Basic ')) {
    const encoded = authHeader.slice(6);
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    // Accept any username; only the password (secret) is validated
    const password = decoded.slice(decoded.indexOf(':') + 1);
    if (password === adminSecret) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Cooldown Admin", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: '/admin/:path*',
};

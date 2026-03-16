import { NextRequest, NextResponse } from 'next/server';

import {
  LOCALE_COOKIE,
  DEFAULT_LOCALE,
  resolveLocale,
} from '@/lib/i18n';

export function GET(request: NextRequest) {
  const locale = resolveLocale(request.nextUrl.searchParams.get('locale'));
  const redirect = request.nextUrl.searchParams.get('redirect') ?? '/';
  const redirectPath =
    redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';
  const response = new NextResponse(null, {
    status: 307,
    headers: { Location: redirectPath },
  });

  response.cookies.set({
    name: LOCALE_COOKIE,
    value: locale,
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
  });

  if (locale === DEFAULT_LOCALE) {
    response.cookies.delete(LOCALE_COOKIE);
  }

  return response;
}

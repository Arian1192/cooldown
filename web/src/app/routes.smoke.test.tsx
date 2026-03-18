import { isValidElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/weeklyDiscover', () => ({
  getWeeklyDiscoverItems: vi.fn(async () => [
    {
      type: 'discover',
      city: 'barcelona',
      tags: ['weekly'],
      slug: 'discover-1',
      title: 'Weekly Discover #1',
      excerpt: 'stub',
      date: '2026-03-03',
      coverImageSrc: '/placeholders/urban-cover.svg',
      coverImageAlt: 'cover',
      episode: 1,
    },
  ]),
}));

vi.mock('@/lib/content', async () => {
  const actual = await vi.importActual<typeof import('@/lib/content')>('@/lib/content');

  return {
    ...actual,
    searchItems: vi.fn(async () => []),
  };
});

describe('critical route smoke', () => {
  it('renders /', async () => {
    const { default: HomePage } = await import('@/app/page');
    const view = await HomePage({ searchParams: Promise.resolve({}) });
    expect(isValidElement(view)).toBe(true);
  });

  it('renders /discover', async () => {
    const { default: DiscoverPage } = await import('@/app/discover/page');
    const view = await DiscoverPage({ searchParams: Promise.resolve({}) });
    expect(isValidElement(view)).toBe(true);
  });

  it('renders /events', async () => {
    const { default: EventsPage } = await import('@/app/events/page');
    const view = await EventsPage({ searchParams: Promise.resolve({}) });
    expect(isValidElement(view)).toBe(true);
  });

  it('renders /search', async () => {
    const { default: SearchPage } = await import('@/app/search/page');
    const view = await SearchPage({ searchParams: Promise.resolve({ q: 'weekly' }) });
    expect(isValidElement(view)).toBe(true);
  });

  it('exports /events/submit page component', async () => {
    const { default: EventSubmitPage } = await import('@/app/events/submit/page');
    expect(typeof EventSubmitPage).toBe('function');
  });
});

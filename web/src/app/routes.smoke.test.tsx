import { isValidElement } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';

import DiscoverPage from '@/app/discover/page';
import EventsPage from '@/app/events/page';
import HomePage from '@/app/page';
import SearchPage from '@/app/search/page';

beforeAll(() => {
  process.env.CONTENT_SOURCE = 'versioned-json';
});

describe('critical route smoke', () => {
  it('renders / without throwing', async () => {
    const view = await HomePage({ searchParams: Promise.resolve({}) });
    expect(isValidElement(view)).toBe(true);
  });

  it('renders /discover without throwing', async () => {
    const view = await DiscoverPage({ searchParams: Promise.resolve({}) });
    expect(isValidElement(view)).toBe(true);
  });

  it('renders /events without throwing', async () => {
    const view = await EventsPage({ searchParams: Promise.resolve({}) });
    expect(isValidElement(view)).toBe(true);
  });

  it('renders /search without throwing', async () => {
    const view = await SearchPage({
      searchParams: Promise.resolve({ q: 'weekly' }),
    });
    expect(isValidElement(view)).toBe(true);
  });
});

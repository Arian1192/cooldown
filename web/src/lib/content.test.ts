import { beforeAll, describe, expect, it } from 'vitest';

import {
  getAllItems,
  getDiscoverWeeklyNeighbors,
  getPagedItems,
  searchItems,
} from '@/lib/content';

beforeAll(() => {
  process.env.CONTENT_SOURCE = 'versioned-json';
});

describe('content repository helpers', () => {
  it('clamps pagination to valid bounds', async () => {
    const first = await getPagedItems('discover', 1, 2);
    const below = await getPagedItems('discover', -5, 2);
    const above = await getPagedItems('discover', 999, 2);

    expect(first.page).toBe(1);
    expect(first.pageCount).toBeGreaterThanOrEqual(1);
    expect(first.items.length).toBeLessThanOrEqual(2);
    expect(below.page).toBe(1);
    expect(above.page).toBe(first.pageCount);
  });

  it('returns query matches from searchable fields', async () => {
    const all = await getAllItems();
    expect(all.length).toBeGreaterThan(0);

    const probe = all[0]!;
    const needle = probe.title.split(/\s+/).find((word) => word.length > 3) ?? probe.title;
    const results = await searchItems({ q: needle });

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item) => item.slug === probe.slug)).toBe(true);
  });

  it('returns weekly discover neighbors in sequence order', async () => {
    const weekly = (await searchItems({ type: 'discover' })).filter(
      (item) => item.episode != null,
    );
    expect(weekly.length).toBeGreaterThan(0);

    const first = await getDiscoverWeeklyNeighbors(weekly[0]!.slug);
    expect(first.previous).toBeNull();
    if (weekly.length > 1) {
      expect(first.next?.slug).toBe(weekly[1]!.slug);
    } else {
      expect(first.next).toBeNull();
    }

    if (weekly.length > 2) {
      const middle = await getDiscoverWeeklyNeighbors(weekly[1]!.slug);
      expect(middle.previous?.slug).toBe(weekly[0]!.slug);
      expect(middle.next?.slug).toBe(weekly[2]!.slug);
    }
  });
});

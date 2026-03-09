import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.CONTENT_SOURCE = "versioned-json";
  process.env.CONTENT_ENABLE_SEED_FALLBACK = "false";
});

describe("content helpers", () => {
  it("clamps paged discover queries to valid bounds", async () => {
    const { getPagedItems } = await import("@/lib/content");
    const firstPage = await getPagedItems("discover", -3, 2);
    const lastPage = await getPagedItems("discover", 999, 2);

    expect(firstPage.page).toBe(1);
    expect(firstPage.items.length).toBeGreaterThan(0);
    expect(lastPage.page).toBe(lastPage.pageCount);
    expect(lastPage.items.length).toBeLessThanOrEqual(2);
  });

  it("filters search by query, type, and city", async () => {
    const { searchItems } = await import("@/lib/content");

    const allMatches = await searchItems({ q: "mural" });
    const cityMatches = await searchItems({
      q: "mural",
      type: "street-art",
      city: "barcelona",
    });

    expect(allMatches.length).toBeGreaterThan(0);
    expect(cityMatches.length).toBe(1);
    expect(cityMatches[0]?.slug).toBe("street-art-1");
  });

  it("returns previous and next weekly discover neighbors", async () => {
    const { getDiscoverWeeklyNeighbors } = await import("@/lib/content");
    const neighbors = await getDiscoverWeeklyNeighbors("discover-2");

    expect(neighbors.previous?.slug).toBe("discover-1");
    expect(neighbors.next?.slug).toBe("discover-3");
  });
});

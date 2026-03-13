import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  extractRaEventId,
  measureRaAutofillCoverage,
  parseResidentAdvisorEvent,
} from '@/lib/events/ra';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('extractRaEventId', () => {
  it('extracts numeric event ids from RA urls', () => {
    expect(extractRaEventId('https://ra.co/events/2211990')).toBe('2211990');
    expect(extractRaEventId('https://ra.co/events/es/barcelona/2211990')).toBe('2211990');
  });

  it('returns null for non RA urls', () => {
    expect(extractRaEventId('https://example.com/events/2211990')).toBeNull();
  });
});

describe('parseResidentAdvisorEvent', () => {
  it('maps JSON-LD metadata into draft-ready structure', async () => {
    const html = `
      <script type="application/ld+json">
        {
          "@context":"https://schema.org",
          "@type":"Event",
          "name":"RA Night Barcelona",
          "description":"Club journey.",
          "startDate":"2026-04-01T23:00:00+02:00",
          "location":{
            "@type":"Place",
            "name":"Input Club",
            "address":{"@type":"PostalAddress","addressLocality":"Barcelona"}
          },
          "organizer":{"@type":"Organization","name":"RA Partner Org"},
          "keywords":"techno, acid",
          "performer":[{"@type":"Person","name":"Artist A"}],
          "offers":{"@type":"Offer","price":"18"}
        }
      </script>
    `;

    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(html, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      }),
    );

    const parsed = await parseResidentAdvisorEvent({
      url: 'https://ra.co/events/2211990',
    });

    expect(parsed).not.toBeNull();
    expect(parsed).toMatchObject({
      sourceExternalId: '2211990',
      title: 'RA Night Barcelona',
      description: 'Club journey.',
      city: 'Barcelona',
      venue: 'Input Club',
      organizer: 'RA Partner Org',
      genres: ['techno', 'acid'],
      lineUp: ['Artist A'],
      priceEur: 18,
    });

    const coverage = measureRaAutofillCoverage(parsed!);
    expect(coverage.ratio).toBeGreaterThanOrEqual(0.8);
  });

  it('falls back safely when metadata cannot be fetched', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('network down'));

    const parsed = await parseResidentAdvisorEvent({
      url: 'https://ra.co/events/555777',
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.title).toContain('RA Import');
    expect(parsed?.city).toBe('Barcelona');
    expect(parsed?.lineUp).toEqual(['TBA']);
  });
});

import { describe, expect, it } from 'vitest';

import { parseResidentAdvisorEventsFromHtml } from '@/lib/raEvents';

const SAMPLE_HTML = `
<html>
  <head></head>
  <body>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Event",
            "name": "Warehouse Session",
            "startDate": "2026-04-20T22:00:00+02:00",
            "url": "/events/123456",
            "image": {
              "@type": "ImageObject",
              "url": "//images.ra.co/abc/flyer.jpg"
            },
            "location": {
              "@type": "Place",
              "name": "Input Club"
            }
          }
        ]
      }
    </script>
  </body>
</html>
`;

describe('parseResidentAdvisorEventsFromHtml', () => {
  it('extracts event metadata from JSON-LD payload', () => {
    const events = parseResidentAdvisorEventsFromHtml(SAMPLE_HTML, 'barcelona');

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      title: 'Warehouse Session',
      venue: 'Input Club',
      city: 'barcelona',
      sourceUrl: 'https://ra.co/events/123456',
      imageUrl: 'https://images.ra.co/abc/flyer.jpg',
    });
  });

  it('ignores invalid event entries', () => {
    const events = parseResidentAdvisorEventsFromHtml(
      '<script type="application/ld+json">{"@type":"Event","name":"No Date"}</script>',
      'madrid',
    );

    expect(events).toEqual([]);
  });
});

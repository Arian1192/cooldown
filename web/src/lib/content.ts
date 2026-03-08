export type ContentType = 'discover' | 'street-art' | 'interviews' | 'reviews';

export type CitySlug = 'barcelona' | 'madrid';

export type SetMoment = 'warm-up' | 'peak-time' | 'closing' | 'after-hours';

export type ContentItem = {
  type: ContentType;
  city: CitySlug;
  tags: string[];
  slug: string;
  title: string;
  excerpt: string;
  date: string;

  // UI: placeholder cover used until CMS provides real media.
  coverImageSrc: string;
  coverImageAlt: string;

  // ── Weekly Discover fields (present only for weekly picks) ──────────────────
  episode?: number;
  trackArtist?: string;
  trackLabel?: string;
  trackReleaseDate?: string;
  bpm?: number;
  musicalKey?: string;
  /** 1 = poor · 5 = essential */
  rating?: 1 | 2 | 3 | 4 | 5;
  verdict?: string;
  technicalBite?: string;
  moodScenario?: string;
  /** 1 = minimal · 5 = full-throttle */
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  setMoment?: SetMoment;
  /** Spotify / SoundCloud / YouTube URL (passed to the matching embed component) */
  embedUrl?: string;
};

const CITY_SEQ: CitySlug[] = ['barcelona', 'madrid'];

const TAGS_BY_TYPE: Record<ContentType, string[]> = {
  discover: ['weekly', 'playlist', 'underground', 'electronic'],
  'street-art': ['mural', 'graffiti', 'gallery', 'photo'],
  interviews: ['artist', 'promoter', 'crew', 'scene'],
  reviews: ['album', 'ep', 'live', 'label'],
};

const seed = (type: ContentType, count: number, startAt = 1): ContentItem[] =>
  Array.from({ length: count }).map((_, i) => {
    const n = startAt + i;
    const city = CITY_SEQ[i % CITY_SEQ.length];
    const tags = TAGS_BY_TYPE[type];

    return {
      type,
      city,
      tags: [tags[i % tags.length]!, tags[(i + 1) % tags.length]!],
      slug: `${type}-${n}`,
      title: `${labelForType(type)} #${n} (${city})`,
      excerpt:
        'Template content. This will be replaced by CMS-backed data in a later sprint.',
      date: new Date(Date.now() - n * 86400000).toISOString().slice(0, 10),
      coverImageSrc: '/placeholders/urban-cover.svg',
      coverImageAlt: `${labelForType(type)} cover`,
    };
  });

// ── Curated Weekly Discover picks ─────────────────────────────────────────────
// These are the real editorial items. The seed() below fills the remaining slots
// with template placeholders (starting at discover-4) until the CMS is live.
const WEEKLY_DISCOVER_PICKS: ContentItem[] = [
  {
    type: 'discover',
    city: 'barcelona',
    tags: ['techno', 'peak-time'],
    slug: 'discover-1',
    title: 'Adam Beyer – Your Mind',
    excerpt:
      'El track con el que Beyer consolidó su dominio del peak time en los 2010. Drumcode en estado puro: máquina perfecta, mezcla clínica, sin concesiones.',
    date: '2026-03-03',
    coverImageSrc: '/placeholders/urban-cover.svg',
    coverImageAlt: 'Adam Beyer – Your Mind',
    episode: 1,
    trackArtist: 'Adam Beyer',
    trackLabel: 'Drumcode',
    trackReleaseDate: 'Nov 2017',
    bpm: 140,
    musicalKey: 'A Minor',
    rating: 4,
    verdict:
      'El ADN sueco de la primera generación (Cari Lekebusch, Hardfloor) está aquí modernizado con una mezcla impecable. La referencia directa a Jeff Mills es obvia pero honesta. Si tiene un defecto: el desarrollo es demasiado predecible — una máquina sin sorpresas. Pero cuando un track suena así de bien, las sorpresas sobran.',
    technicalBite:
      'El bombo lleva saturación analógica en la frecuencia de 160 Hz que simula un amplificador de válvulas empujado al límite: percibes el golpe como presión física, no como sonido. La snare tiene un decay ultracorto (<30 ms) que genera el latigazo característico del techno de Drumcode. El bajo opera casi exclusivamente por debajo de 80 Hz — inaudible por separado, devastador en un sistema de PA bien calibrado.',
    moodScenario:
      'Las 2am en el cuarto de máquinas. Estás prácticamente solo en la pista y no importa. El DJ está concentrado, la cabina elevada, y este track está haciendo exactamente lo que tiene que hacer.',
    energyLevel: 5,
    setMoment: 'peak-time',
    embedUrl: 'https://open.spotify.com/track/1WsHKAuN9vDthcmimdqqaY',
  },
  {
    type: 'discover',
    city: 'barcelona',
    tags: ['techno', 'minimal'],
    slug: 'discover-2',
    title: 'Ben Klock – Subzero',
    excerpt:
      'Uno de los documentos más importantes del sonido Berghain. Klock capturó en 2009 la esencia del techno de Friedrichshain mejor que nadie antes o después.',
    date: '2026-02-24',
    coverImageSrc: '/placeholders/urban-cover.svg',
    coverImageAlt: 'Ben Klock – Subzero',
    episode: 2,
    trackArtist: 'Ben Klock',
    trackLabel: 'Ostgut Ton',
    trackReleaseDate: 'May 2009',
    bpm: 135,
    musicalKey: 'B Minor',
    rating: 5,
    verdict:
      'Minimalismo radical que nunca cae en el vacío — cada capa tiene un propósito y un peso específico. La referencia no es Mills ni Plastikman: es el propio Berghain, como espacio acústico y como estado mental. Una pieza maestra que sigue siendo la referencia para productores que aspiran a entender qué es el techno de verdad.',
    technicalBite:
      'La arquitectura de frecuencias es diseño de precisión milimétrica: el espectro por debajo de 60 Hz está deliberadamente vacío — el track solo existe en su plenitud a través de los subgraves de Berghain. El pad central son cuatro notas en un loop de 32 pasos con micromodulación de amplitud a ~0.3 Hz que crea un respirar orgánico casi imperceptible. Nada es accidental.',
    moodScenario:
      'Berghain, cuarto piso, 7am del domingo. El DJ lleva seis horas tocando. Este track empieza y nadie puede explicar cómo ha llegado ahí ni cuándo se fueron los demás. Solo saben que no se van a mover.',
    energyLevel: 3,
    setMoment: 'closing',
    embedUrl: 'https://open.spotify.com/track/0SSZR0TTrvDttPqiBQZkig',
  },
  {
    type: 'discover',
    city: 'madrid',
    tags: ['techno', 'groove'],
    slug: 'discover-3',
    title: 'Amelie Lens – Follow',
    excerpt:
      'Lens en estado puro: bass line sinuosa, bombo hipnótico, cero adornos. La influencia del techno belga de los R&S years modernizada con producción absolutamente contemporánea.',
    date: '2026-02-17',
    coverImageSrc: '/placeholders/urban-cover.svg',
    coverImageAlt: 'Amelie Lens – Follow',
    episode: 3,
    trackArtist: 'Amelie Lens',
    trackLabel: 'Lenske Records',
    trackReleaseDate: 'Feb 2020',
    bpm: 130,
    musicalKey: 'G Minor',
    rating: 4,
    verdict:
      'Influencia directa del periodo Nuclear Waste / early R&S, pero la producción es de 2020 sin reservas. Lo que más sorprende es la economía de medios: cuatro elementos, todos necesarios, ninguno prescindible. Le falta un instante de tensión real antes del drop — el nivel de intensidad es constante y sin picos, lo que lo hace perfecto para el mix pero menos memorable como track independiente.',
    technicalBite:
      'La bass line tiene un filtro paso-bajo con cutoff micromodulado (~20 Hz de variación) que crea una sensación de tirón rítmico adictivo: el cerebro lo procesa como movimiento, no como sonido. La snare está sumada con ruido blanco de decay ultracorto que añade textura sin comprometer la limpieza. El bus master corre un VCA limiter agresivo que hace al track inmune a variaciones de ganancia — funciona igual al 60% que al 100% del PA.',
    moodScenario:
      'Primera noche en una ciudad que no conoces. Entras sin plan a un club del que no sabes el nombre. Este track está sonando. Una hora después no has salido de la pista.',
    energyLevel: 4,
    setMoment: 'peak-time',
    embedUrl: 'https://open.spotify.com/track/5UsfWcP6SThHlZ4oAgx7ge',
  },
];

export const CONTENT: Record<ContentType, ContentItem[]> = {
  discover: [...WEEKLY_DISCOVER_PICKS, ...seed('discover', 20, 4)],
  'street-art': seed('street-art', 17),
  interviews: seed('interviews', 12),
  reviews: seed('reviews', 31),
};

export function labelForType(type: ContentType) {
  switch (type) {
    case 'discover':
      return 'Weekly Discover';
    case 'street-art':
      return 'Street Art Gallery';
    case 'interviews':
      return 'Artist Interview';
    case 'reviews':
      return 'Album Review';
  }
}

export function labelForCity(city: CitySlug) {
  switch (city) {
    case 'barcelona':
      return 'Barcelona';
    case 'madrid':
      return 'Madrid';
  }
}

export function getItem(type: ContentType, slug: string) {
  return CONTENT[type].find((x) => x.slug === slug) ?? null;
}

export function getPagedItems(
  type: ContentType,
  page: number,
  pageSize: number,
) {
  const items = CONTENT[type];
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { items: slice, page: safePage, pageCount };
}

export function getDiscoverArchivePaged(page: number, pageSize: number) {
  const items = CONTENT.discover.filter((item) => item.episode == null);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { items: slice, page: safePage, pageCount };
}

export function getDiscoverWeeklyNeighbors(slug: string) {
  const weeklyItems = CONTENT.discover.filter((item) => item.episode != null);
  const index = weeklyItems.findIndex((item) => item.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: weeklyItems[index - 1] ?? null,
    next: weeklyItems[index + 1] ?? null,
  };
}

export function getAllItems(): ContentItem[] {
  return Object.values(CONTENT).flat();
}

export function searchItems({
  q,
  type,
  city,
}: {
  q?: string;
  type?: ContentType;
  city?: CitySlug;
}) {
  const normalized = (q ?? '').trim().toLowerCase();

  return getAllItems().filter((item) => {
    if (type && item.type !== type) return false;
    if (city && item.city !== city) return false;

    if (!normalized) return true;

    const haystack = [item.title, item.excerpt, item.city, item.tags.join(' ')]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

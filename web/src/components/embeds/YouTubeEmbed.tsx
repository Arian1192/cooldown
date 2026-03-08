import { EmbedFallback } from '@/components/embeds/EmbedFallback';
import { EmbedFrame } from '@/components/embeds/EmbedFrame';

function toYouTubeEmbedSrc(
  input: string,
): { src: string; videoId: string } | null {
  try {
    // Accept: raw ID, https://youtu.be/<id>, https://www.youtube.com/watch?v=<id>, https://www.youtube.com/embed/<id>
    if (/^[a-zA-Z0-9_-]{8,}$/.test(input) && !input.includes('/')) {
      return { src: `https://www.youtube.com/embed/${input}`, videoId: input };
    }

    const url = new URL(input);
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.replace('/', '');
      if (!id) return null;
      return { src: `https://www.youtube.com/embed/${id}`, videoId: id };
    }

    if (url.hostname.endsWith('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) {
        const id = url.pathname.split('/embed/')[1];
        if (!id) return null;
        return { src: `https://www.youtube.com/embed/${id}`, videoId: id };
      }
      const id = url.searchParams.get('v');
      if (!id) return null;
      return { src: `https://www.youtube.com/embed/${id}`, videoId: id };
    }

    return null;
  } catch {
    return null;
  }
}

export function YouTubeEmbed({
  url,
  title = 'YouTube embed',
  className,
}: {
  url: string;
  title?: string;
  className?: string;
}) {
  const parsed = toYouTubeEmbedSrc(url);
  if (!parsed)
    return (
      <EmbedFallback
        provider="YouTube"
        href={url}
        reason="Invalid YouTube URL."
      />
    );

  const src = `${parsed.src}?rel=0&modestbranding=1`;

  return (
    <EmbedFrame
      title={title}
      src={src}
      rounded
      className={className}
      aspect="16/9"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      sandbox="allow-scripts allow-same-origin allow-presentation"
    />
  );
}

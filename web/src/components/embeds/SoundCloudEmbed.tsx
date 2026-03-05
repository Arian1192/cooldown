import { EmbedFallback } from "@/components/embeds/EmbedFallback";
import { EmbedFrame } from "@/components/embeds/EmbedFrame";

function toSoundCloudSrc(url: string) {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("soundcloud.com")) return null;

    const encoded = encodeURIComponent(url);
    // SoundCloud uses a fixed-height player; we keep height to minimize CLS.
    return `https://w.soundcloud.com/player/?url=${encoded}&color=%23a855f7&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
  } catch {
    return null;
  }
}

export function SoundCloudEmbed({
  url,
  title = "SoundCloud embed",
}: {
  url: string;
  title?: string;
}) {
  const src = toSoundCloudSrc(url);
  if (!src) return <EmbedFallback provider="SoundCloud" href={url} reason="Invalid SoundCloud URL." />;

  return (
    <EmbedFrame
      title={title}
      src={src}
      height={166}
      allow="autoplay"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}

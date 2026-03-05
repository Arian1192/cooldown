import { EmbedFallback } from "@/components/embeds/EmbedFallback";
import { EmbedFrame } from "@/components/embeds/EmbedFrame";

function toSpotifyEmbedSrc(input: string) {
  try {
    const url = new URL(input);
    if (!url.hostname.endsWith("spotify.com")) return null;

    // Accept normal URLs like https://open.spotify.com/track/<id>
    // Convert to https://open.spotify.com/embed/track/<id>
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const [kind, id] = parts;
    if (!kind || !id) return null;

    return `https://open.spotify.com/embed/${kind}/${id}`;
  } catch {
    // raw embed url? allow as-is if it looks like spotify embed
    if (input.startsWith("https://open.spotify.com/embed/")) return input;
    return null;
  }
}

export function SpotifyEmbed({
  url,
  title = "Spotify embed",
  variant = "compact",
}: {
  url: string;
  title?: string;
  variant?: "compact" | "regular";
}) {
  const src = toSpotifyEmbedSrc(url);
  if (!src) return <EmbedFallback provider="Spotify" href={url} reason="Invalid Spotify URL." />;

  // Spotify uses fixed heights.
  const height = variant === "compact" ? 152 : 352;

  return (
    <EmbedFrame
      title={title}
      src={src}
      height={height}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      sandbox="allow-scripts allow-same-origin allow-popups"
    />
  );
}

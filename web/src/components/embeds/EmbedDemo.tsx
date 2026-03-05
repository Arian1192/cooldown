import { SpotifyEmbed } from "@/components/embeds/SpotifyEmbed";
import { SoundCloudEmbed } from "@/components/embeds/SoundCloudEmbed";
import { YouTubeEmbed } from "@/components/embeds/YouTubeEmbed";

export function EmbedDemo() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Embeds (safe)</h2>
        <p className="text-sm text-muted">
          These are responsive wrappers with fixed aspect ratio / height to
          minimize layout shift. If an embed URL is invalid, a fallback card is
          shown.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted">YouTube</div>
          <YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted">Spotify</div>
          <SpotifyEmbed url="https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted">SoundCloud</div>
          <SoundCloudEmbed url="https://soundcloud.com/monstercat/monstercat-call-of-the-wild-ep-1" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted">Invalid URL demo</div>
          <YouTubeEmbed url="https://example.com/not-youtube" />
        </div>
      </div>
    </section>
  );
}

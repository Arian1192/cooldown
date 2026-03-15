import type { NextConfig } from "next";

function envHost(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const knownImageHosts = new Set<string>([
  "i.scdn.co",
  "images.ra.co",
  "cms-cooldown-roan.ariancoro.com",
]);

const envImageHosts = [
  envHost(process.env.STRAPI_URL),
  envHost(process.env.CMS_BASE_URL),
].filter((host): host is string => host != null);

for (const host of envImageHosts) {
  knownImageHosts.add(host);
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: Array.from(knownImageHosts).map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
};

export default nextConfig;

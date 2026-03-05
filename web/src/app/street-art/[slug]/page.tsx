import { ContentDetail } from "@/components/ContentDetail";

export default async function StreetArtDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentDetail type="street-art" slug={slug} />;
}

import { ContentDetail } from "@/components/ContentDetail";

export default async function DiscoverDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentDetail type="discover" slug={slug} />;
}

import { ContentDetail } from "@/components/ContentDetail";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentDetail type="reviews" slug={slug} />;
}

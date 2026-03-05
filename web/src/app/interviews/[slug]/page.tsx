import { ContentDetail } from "@/components/ContentDetail";

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentDetail type="interviews" slug={slug} />;
}

import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";

export default function NotFound() {
  return (
    <div className="space-y-5">
      <PageHeader title="404" caption="That page does not exist." />
      <Link
        className="inline-flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
        href="/"
      >
        Back home
      </Link>
    </div>
  );
}

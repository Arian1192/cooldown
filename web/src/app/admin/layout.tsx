import type { Metadata } from 'next';

import { AdminNav } from './AdminNav';

export const metadata: Metadata = {
  title: 'Admin · Cooldown',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex relative">
      <AdminNav />
      <div className="flex-1 flex flex-col pt-14">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

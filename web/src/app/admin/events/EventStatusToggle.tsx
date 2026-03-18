'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface EventStatusToggleProps {
  eventId: string;
  currentStatus: 'draft' | 'published';
}

export function EventStatusToggle({ eventId, currentStatus }: EventStatusToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setLoading(true);
    setError(null);
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? `Error ${res.status}`);
        return;
      }
      router.refresh();
    } catch {
      setError('Error de red. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={[
          'border px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] transition-colors disabled:opacity-50',
          currentStatus === 'published'
            ? 'border-yellow-400/40 text-yellow-300 hover:bg-yellow-400/10'
            : 'border-green-400/40 text-green-300 hover:bg-green-400/10',
        ].join(' ')}
      >
        {loading ? '...' : currentStatus === 'published' ? 'Despublicar' : 'Publicar'}
      </button>
      {error && <p className="text-[10px] text-red-300">{error}</p>}
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ModerationActionsProps {
  requestId: string;
  currentStatus: string;
}

export function ModerationActions({ requestId, currentStatus }: ModerationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (currentStatus !== 'pending_review') {
    return null;
  }

  async function handleApprove() {
    setLoading('approve');
    setError(null);
    try {
      const res = await fetch(`/api/events/requests/${requestId}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
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
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading('reject');
    setError(null);
    try {
      const res = await fetch(`/api/events/requests/${requestId}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', moderationNotes: rejectNotes.trim() || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? `Error ${res.status}`);
        return;
      }
      setShowRejectForm(false);
      setRejectNotes('');
      router.refresh();
    } catch {
      setError('Error de red. Inténtalo de nuevo.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-300">{error}</p>
      )}

      {!showRejectForm ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleApprove}
            disabled={loading !== null}
            className="inline-flex items-center bg-accent px-4 py-2 font-[family-name:var(--font-barlow)] text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground transition-opacity disabled:opacity-50"
          >
            {loading === 'approve' ? 'Aprobando...' : 'Aprobar'}
          </button>
          <button
            type="button"
            onClick={() => setShowRejectForm(true)}
            disabled={loading !== null}
            className="inline-flex items-center border border-[hsl(var(--border))] px-4 py-2 font-[family-name:var(--font-barlow)] text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--muted))] transition-colors hover:border-red-400/60 hover:text-red-300 disabled:opacity-50"
          >
            Rechazar
          </button>
        </div>
      ) : (
        <div className="space-y-3 border border-[hsl(var(--border))] p-4">
          <p className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted))]">
            Nota de rechazo (opcional)
          </p>
          <textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder="Explica el motivo del rechazo..."
            rows={3}
            className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted)/0.4)] focus:border-[hsl(var(--accent))] focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={loading !== null}
              className="inline-flex items-center border border-red-400/60 px-4 py-2 font-[family-name:var(--font-barlow)] text-[10px] font-bold uppercase tracking-[0.2em] text-red-300 transition-colors hover:bg-red-400/10 disabled:opacity-50"
            >
              {loading === 'reject' ? 'Rechazando...' : 'Confirmar rechazo'}
            </button>
            <button
              type="button"
              onClick={() => { setShowRejectForm(false); setRejectNotes(''); }}
              disabled={loading !== null}
              className="inline-flex items-center border border-[hsl(var(--border))] px-4 py-2 font-[family-name:var(--font-barlow)] text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--muted))] transition-colors hover:text-[hsl(var(--foreground))] disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

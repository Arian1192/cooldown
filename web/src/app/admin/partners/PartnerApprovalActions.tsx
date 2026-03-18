'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { PartnerStatus } from '@/lib/events/types';

interface PartnerApprovalActionsProps {
  partnerId: string;
  currentStatus: PartnerStatus;
}

export function PartnerApprovalActions({ partnerId, currentStatus }: PartnerApprovalActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  async function handleApprove() {
    if (!confirm('¿Aprobar este partner?')) return;
    setLoading('approve');
    setError(null);
    try {
      const res = await fetch(`/api/events/partners/${partnerId}/approve`, { method: 'POST' });
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
      const res = await fetch(`/api/events/partners/${partnerId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason.trim() || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? `Error ${res.status}`);
        return;
      }
      setShowRejectForm(false);
      setRejectReason('');
      router.refresh();
    } catch {
      setError('Error de red. Inténtalo de nuevo.');
    } finally {
      setLoading(null);
    }
  }

  if (currentStatus === 'approved') {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => { setShowRejectForm(true); setError(null); }}
          disabled={loading !== null}
          className="border border-red-400/40 px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-red-300 transition-colors hover:bg-red-400/10 disabled:opacity-50"
        >
          Rechazar
        </button>
        {showRejectForm && (
          <div className="mt-2 flex flex-col gap-2 w-64">
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motivo (opcional)"
              className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-[hsl(var(--accent)/0.5)]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReject}
                disabled={loading === 'reject'}
                className="flex-1 border border-red-400/40 px-2 py-1 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-red-300 hover:bg-red-400/10 disabled:opacity-50"
              >
                {loading === 'reject' ? '...' : 'Confirmar'}
              </button>
              <button
                type="button"
                onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
                className="flex-1 border border-[hsl(var(--border))] px-2 py-1 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        {error && <p className="text-[10px] text-red-300">{error}</p>}
      </div>
    );
  }

  if (currentStatus === 'rejected') {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={handleApprove}
          disabled={loading !== null}
          className="border border-green-400/40 px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-green-300 transition-colors hover:bg-green-400/10 disabled:opacity-50"
        >
          {loading === 'approve' ? '...' : 'Aprobar'}
        </button>
        {error && <p className="text-[10px] text-red-300">{error}</p>}
      </div>
    );
  }

  // pending_approval
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={loading !== null}
          className="border border-green-400/40 px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-green-300 transition-colors hover:bg-green-400/10 disabled:opacity-50"
        >
          {loading === 'approve' ? '...' : 'Aprobar'}
        </button>
        <button
          type="button"
          onClick={() => { setShowRejectForm(true); setError(null); }}
          disabled={loading !== null}
          className="border border-red-400/40 px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-red-300 transition-colors hover:bg-red-400/10 disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
      {showRejectForm && (
        <div className="mt-2 flex flex-col gap-2 w-64">
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo (opcional)"
            className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-[hsl(var(--accent)/0.5)]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={loading === 'reject'}
              className="flex-1 border border-red-400/40 px-2 py-1 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-red-300 hover:bg-red-400/10 disabled:opacity-50"
            >
              {loading === 'reject' ? '...' : 'Confirmar rechazo'}
            </button>
            <button
              type="button"
              onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
              className="flex-1 border border-[hsl(var(--border))] px-2 py-1 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-[10px] text-red-300">{error}</p>}
    </div>
  );
}

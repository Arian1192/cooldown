'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { PartnerRecord } from '@/lib/events/types';

interface PartnerCrudActionsProps {
  partner: Pick<PartnerRecord, 'id' | 'name' | 'slug' | 'contactEmail' | 'raProfileUrl'>;
}

export function PartnerCrudActions({ partner }: PartnerCrudActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState<'save' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(partner.name);
  const [slug, setSlug] = useState(partner.slug);
  const [contactEmail, setContactEmail] = useState(partner.contactEmail);
  const [raProfileUrl, setRaProfileUrl] = useState(partner.raProfileUrl ?? '');

  async function handleSave() {
    setLoading('save');
    setError(null);
    try {
      const res = await fetch(`/api/events/partners/${partner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          slug: slug.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          raProfileUrl: raProfileUrl.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? `Error ${res.status}`);
        return;
      }
      setShowEdit(false);
      router.refresh();
    } catch {
      setError('Error de red. Inténtalo de nuevo.');
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    setLoading('delete');
    setError(null);
    try {
      const res = await fetch(`/api/events/partners/${partner.id}`, { method: 'DELETE' });
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

  if (showEdit) {
    return (
      <div className="flex flex-col gap-2 w-72">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-[hsl(var(--accent)/0.5)]"
        />
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Slug"
          className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-[hsl(var(--accent)/0.5)]"
        />
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="Email de contacto"
          className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-[hsl(var(--accent)/0.5)]"
        />
        <input
          type="url"
          value={raProfileUrl}
          onChange={(e) => setRaProfileUrl(e.target.value)}
          placeholder="URL perfil RA (opcional)"
          className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-[hsl(var(--accent)/0.5)]"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading === 'save'}
            className="flex-1 border border-[hsl(var(--accent)/0.4)] px-2 py-1 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.08)] disabled:opacity-50"
          >
            {loading === 'save' ? '...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => { setShowEdit(false); setError(null); }}
            className="flex-1 border border-[hsl(var(--border))] px-2 py-1 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          >
            Cancelar
          </button>
        </div>
        {error && <p className="text-[10px] text-red-300">{error}</p>}
      </div>
    );
  }

  if (showDeleteConfirm) {
    return (
      <div className="flex flex-col items-end gap-2">
        <p className="text-[10px] text-[hsl(var(--muted))]">¿Eliminar este partner?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading === 'delete'}
            className="border border-red-400/40 px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-red-300 hover:bg-red-400/10 disabled:opacity-50"
          >
            {loading === 'delete' ? '...' : 'Confirmar'}
          </button>
          <button
            type="button"
            onClick={() => { setShowDeleteConfirm(false); setError(null); }}
            className="border border-[hsl(var(--border))] px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          >
            Cancelar
          </button>
        </div>
        {error && <p className="text-[10px] text-red-300">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => { setShowEdit(true); setError(null); }}
        className="border border-[hsl(var(--border))] px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] transition-colors hover:border-[hsl(var(--accent)/0.4)] hover:text-[hsl(var(--foreground))]"
      >
        Editar
      </button>
      <button
        type="button"
        onClick={() => { setShowDeleteConfirm(true); setError(null); }}
        className="border border-red-400/40 px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-red-300 transition-colors hover:bg-red-400/10"
      >
        Eliminar
      </button>
    </div>
  );
}

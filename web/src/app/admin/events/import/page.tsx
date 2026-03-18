'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface EventRecord {
  id: string;
  title: string;
  date: string;
  city: string;
  venue: string;
  status: 'draft' | 'published';
  source: { sourceUrl?: string; importedAt?: string };
}

interface ImportResult {
  message: string;
  deduplicated: boolean;
  data: EventRecord;
}

interface SyncResult {
  message: string;
  totals: { imported: number; skipped: number; failed: number };
  imported: Array<{ url: string; eventId: string }>;
  skipped: Array<{ url: string; eventId: string; reason: string }>;
  failed: Array<{ url: string; reason: string }>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const inputClass =
  'w-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 font-[family-name:var(--font-barlow)] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:border-[hsl(var(--accent))] focus:outline-none transition-colors';

const btnClass =
  'border px-5 py-2.5 font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.18em] transition-colors disabled:opacity-40';

const sectionHeading =
  'font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--muted))] mb-4';

export default function RaImportPage() {
  // Individual import state
  const [importUrl, setImportUrl] = useState('');
  const [importOrganizer, setImportOrganizer] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Batch sync state
  const [syncUrls, setSyncUrls] = useState('');
  const [syncOrganizer, setSyncOrganizer] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Recent imports state
  const [recentImports, setRecentImports] = useState<EventRecord[]>([]);
  const [importsLoading, setImportsLoading] = useState(true);

  const fetchRecentImports = useCallback(async () => {
    setImportsLoading(true);
    try {
      const res = await fetch('/api/events?origin=ra_imported');
      if (res.ok) {
        const body = await res.json();
        setRecentImports((body.data as EventRecord[]).slice(0, 20));
      }
    } finally {
      setImportsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentImports();
  }, [fetchRecentImports]);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setImportLoading(true);
    setImportResult(null);
    setImportError(null);

    try {
      const body: Record<string, string> = { url: importUrl.trim() };
      if (importOrganizer.trim()) body.organizer = importOrganizer.trim();

      const res = await fetch('/api/events/import/ra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data?.error ?? `Error ${res.status}`);
        return;
      }
      setImportResult(data as ImportResult);
      setImportUrl('');
      setImportOrganizer('');
      fetchRecentImports();
    } catch {
      setImportError('Error de red. Inténtalo de nuevo.');
    } finally {
      setImportLoading(false);
    }
  }

  async function handleSync(e: React.FormEvent) {
    e.preventDefault();
    setSyncLoading(true);
    setSyncResult(null);
    setSyncError(null);

    const urls = syncUrls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      setSyncError('Introduce al menos una URL.');
      setSyncLoading(false);
      return;
    }

    try {
      const body: Record<string, unknown> = { urls };
      if (syncOrganizer.trim()) body.organizer = syncOrganizer.trim();

      const res = await fetch('/api/events/import/ra/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setSyncError(data?.error ?? `Error ${res.status}`);
        return;
      }
      setSyncResult(data as SyncResult);
      setSyncUrls('');
      setSyncOrganizer('');
      fetchRecentImports();
    } catch {
      setSyncError('Error de red. Inténtalo de nuevo.');
    } finally {
      setSyncLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-barlow)] text-[clamp(1.6rem,3vw,2.4rem)] font-bold uppercase tracking-[-0.02em]">
          Importar desde RA
        </h1>
        <p className="mt-1 font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
          Importa eventos de Resident Advisor al backoffice
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Individual import */}
        <section className="border border-[hsl(var(--border))] p-6">
          <p className={sectionHeading}>Importación individual</p>
          <form onSubmit={handleImport} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                URL del evento en RA
              </label>
              <input
                type="url"
                required
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://ra.co/events/1234567"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                Organizador (opcional)
              </label>
              <input
                type="text"
                value={importOrganizer}
                onChange={(e) => setImportOrganizer(e.target.value)}
                placeholder="Nombre del club o promotor"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={importLoading || !importUrl.trim()}
              className={`${btnClass} border-[hsl(var(--accent)/0.5)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.08)]`}
            >
              {importLoading ? 'Importando…' : 'Importar evento'}
            </button>
          </form>

          {importError && (
            <div className="mt-4 border border-red-400/30 bg-red-400/5 p-4">
              <p className="font-[family-name:var(--font-barlow)] text-[11px] text-red-300">{importError}</p>
            </div>
          )}

          {importResult && (
            <div className="mt-4 border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
              <p className="mb-2 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                {importResult.deduplicated ? 'Ya existía — no se duplicó' : 'Importado como borrador'}
              </p>
              <p className="font-[family-name:var(--font-barlow)] font-bold uppercase tracking-[-0.01em]">
                {importResult.data.title}
              </p>
              <p className="mt-1 font-[family-name:var(--font-barlow)] text-[11px] text-[hsl(var(--muted))]">
                {importResult.data.venue} · {importResult.data.city} · {formatDate(importResult.data.date)}
              </p>
              <Link
                href="/admin/events"
                className="mt-3 inline-block font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--accent))] hover:opacity-70 transition-opacity"
              >
                Ver en admin →
              </Link>
            </div>
          )}
        </section>

        {/* Batch sync */}
        <section className="border border-[hsl(var(--border))] p-6">
          <p className={sectionHeading}>Sincronización batch</p>
          <p className="mb-4 font-[family-name:var(--font-barlow)] text-[11px] text-[hsl(var(--muted))]">
            Pega una URL de evento de RA por línea. Se importarán todos los eventos que no existan aún.
          </p>
          <form onSubmit={handleSync} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                URLs de eventos (una por línea)
              </label>
              <textarea
                required
                rows={6}
                value={syncUrls}
                onChange={(e) => setSyncUrls(e.target.value)}
                placeholder={`https://ra.co/events/1234567\nhttps://ra.co/events/8901234`}
                className={`${inputClass} resize-y`}
              />
            </div>
            <div>
              <label className="mb-1.5 block font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                Organizador (opcional)
              </label>
              <input
                type="text"
                value={syncOrganizer}
                onChange={(e) => setSyncOrganizer(e.target.value)}
                placeholder="Nombre del club o promotor"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={syncLoading || !syncUrls.trim()}
              className={`${btnClass} border-[hsl(var(--accent)/0.5)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.08)]`}
            >
              {syncLoading ? 'Sincronizando…' : 'Sincronizar eventos'}
            </button>
          </form>

          {syncError && (
            <div className="mt-4 border border-red-400/30 bg-red-400/5 p-4">
              <p className="font-[family-name:var(--font-barlow)] text-[11px] text-red-300">{syncError}</p>
            </div>
          )}

          {syncResult && (
            <div className="mt-4 border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
              <p className="mb-3 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                Resultado de sincronización
              </p>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="font-[family-name:var(--font-barlow)] text-xl font-bold text-green-300">
                    {syncResult.totals.imported}
                  </p>
                  <p className="font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                    Importados
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-[family-name:var(--font-barlow)] text-xl font-bold text-yellow-300">
                    {syncResult.totals.skipped}
                  </p>
                  <p className="font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                    Ya existían
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-[family-name:var(--font-barlow)] text-xl font-bold text-red-300">
                    {syncResult.totals.failed}
                  </p>
                  <p className="font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                    Errores
                  </p>
                </div>
              </div>
              {syncResult.totals.failed > 0 && (
                <div className="mt-3">
                  <p className="mb-1 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.14em] text-red-300">
                    URLs con error:
                  </p>
                  <ul className="space-y-0.5">
                    {syncResult.failed.map((f) => (
                      <li key={f.url} className="font-[family-name:var(--font-barlow)] text-[10px] text-[hsl(var(--muted))] truncate">
                        {f.url}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {syncResult.totals.imported > 0 && (
                <Link
                  href="/admin/events"
                  className="mt-3 inline-block font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--accent))] hover:opacity-70 transition-opacity"
                >
                  Ver en admin →
                </Link>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Recent RA imports */}
      <section className="mt-10">
        <p className={sectionHeading}>Importaciones recientes (RA)</p>
        {importsLoading ? (
          <p className="font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
            Cargando…
          </p>
        ) : recentImports.length === 0 ? (
          <div className="border border-[hsl(var(--border))] p-10 text-center">
            <p className="font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--muted))]">
              No hay eventos importados desde RA todavía
            </p>
          </div>
        ) : (
          <div className="border border-[hsl(var(--border))] overflow-hidden" style={{ borderRadius: 'var(--radius)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                  <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                    Título
                  </th>
                  <th className="hidden px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] md:table-cell">
                    Fecha
                  </th>
                  <th className="hidden px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] lg:table-cell">
                    Venue
                  </th>
                  <th className="hidden px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] sm:table-cell">
                    Ciudad
                  </th>
                  <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                    Estado
                  </th>
                  <th className="px-5 py-3 text-right font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                    Fuente
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {recentImports.map((event) => (
                  <tr
                    key={event.id}
                    className="bg-[hsl(var(--background))] transition-colors hover:bg-[hsl(var(--surface))]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-[family-name:var(--font-barlow)] font-bold uppercase leading-tight tracking-[-0.01em]">
                        {event.title}
                      </p>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className="text-xs text-[hsl(var(--muted))]">{formatDate(event.date)}</span>
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <span className="text-xs text-[hsl(var(--muted))]">{event.venue}</span>
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <span className="text-xs text-[hsl(var(--muted))]">{event.city}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center border px-2 py-0.5 font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.2em] ${
                          event.status === 'published'
                            ? 'border-green-400/40 bg-green-400/10 text-green-300'
                            : 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300'
                        }`}
                      >
                        {event.status === 'published' ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {event.source.sourceUrl ? (
                        <a
                          href={event.source.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.14em] text-purple-300 hover:opacity-70 transition-opacity"
                        >
                          RA →
                        </a>
                      ) : (
                        <span className="font-[family-name:var(--font-barlow)] text-[10px] text-[hsl(var(--muted))]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

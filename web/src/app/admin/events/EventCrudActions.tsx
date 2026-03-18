'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { EventRecord } from '@/lib/events/types';

type EventType = 'club_night' | 'showcase' | 'pop_up' | 'workshop';

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'club_night', label: 'Club Night' },
  { value: 'showcase', label: 'Showcase' },
  { value: 'pop_up', label: 'Pop-Up' },
  { value: 'workshop', label: 'Workshop' },
];

interface EventCrudActionsProps {
  event: Pick<EventRecord, 'id' | 'title' | 'description' | 'date' | 'venue' | 'city' | 'eventType' | 'priceEur'>;
}

export function EventCrudActions({ event }: EventCrudActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState<'save' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? '');
  const [date, setDate] = useState(event.date);
  const [venue, setVenue] = useState(event.venue);
  const [city, setCity] = useState(event.city);
  const [eventType, setEventType] = useState<EventType>(event.eventType as EventType);
  const [priceEur, setPriceEur] = useState(event.priceEur != null ? String(event.priceEur) : '');

  async function handleSave() {
    setLoading('save');
    setError(null);
    const priceNum = priceEur.trim() ? Number(priceEur) : null;
    if (priceEur.trim() && (isNaN(priceNum!) || priceNum! < 0)) {
      setError('Precio inválido');
      setLoading(null);
      return;
    }
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || undefined,
          description: description.trim() || null,
          date: date.trim() || undefined,
          venue: venue.trim() || undefined,
          city: city.trim() || undefined,
          eventType,
          priceEur: priceNum,
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
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
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
      <div className="flex flex-col gap-2 w-80">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-[hsl(var(--accent)/0.5)]"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          rows={2}
          className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-[hsl(var(--accent)/0.5)] resize-none"
        />
        <input
          type="text"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="Fecha (ISO)"
          className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-[hsl(var(--accent)/0.5)]"
        />
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="Venue"
          className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-[hsl(var(--accent)/0.5)]"
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ciudad"
          className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-[hsl(var(--accent)/0.5)]"
        />
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value as EventType)}
          className="border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--accent)/0.5)]"
        >
          {EVENT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="number"
          value={priceEur}
          onChange={(e) => setPriceEur(e.target.value)}
          placeholder="Precio EUR (opcional)"
          min="0"
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
        <p className="text-[10px] text-[hsl(var(--muted))]">¿Eliminar este evento?</p>
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

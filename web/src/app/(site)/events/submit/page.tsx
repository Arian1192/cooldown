'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { EventType } from '@/lib/events/types';

type FormState =
  | { phase: 'idle' }
  | { phase: 'submitting' }
  | { phase: 'success'; identifier: string }
  | { phase: 'error'; messages: string[] };

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'club_night', label: 'Club Night' },
  { value: 'showcase', label: 'Showcase' },
  { value: 'pop_up', label: 'Pop-Up' },
  { value: 'workshop', label: 'Workshop' },
];

const GENRE_OPTIONS = [
  'Techno',
  'House',
  'Electro',
  'Ambient',
  'Acid',
  'Drum & Bass',
  'Jungle',
  'Industrial',
  'Noise',
  'Experimental',
];

const CITY_OPTIONS = [
  { value: 'barcelona', label: 'Barcelona' },
  { value: 'madrid', label: 'Madrid' },
];

function FieldLabel({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted"
    >
      {children}
      {optional && <span className="ml-2 font-normal normal-case tracking-normal text-muted/50">optional</span>}
    </label>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/40 focus:border-accent focus:outline-none"
    />
  );
}

export default function EventSubmitPage() {
  const [partnerName, setPartnerName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');
  const [venue, setVenue] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [lineUp, setLineUp] = useState<string[]>(['']);
  const [eventType, setEventType] = useState<EventType | ''>('');
  const [priceEur, setPriceEur] = useState('');
  const [ticketUrl, setTicketUrl] = useState('');
  const [sourceRaUrl, setSourceRaUrl] = useState('');
  const [formState, setFormState] = useState<FormState>({ phase: 'idle' });

  function toggleGenre(genre: string) {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  }

  function updateArtist(index: number, value: string) {
    setLineUp((prev) => prev.map((a, i) => (i === index ? value : a)));
  }

  function addArtist() {
    setLineUp((prev) => [...prev, '']);
  }

  function removeArtist(index: number) {
    setLineUp((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (!partnerName.trim()) errors.push('El nombre del club/promotor es obligatorio.');
    if (!contactEmail.trim() || !contactEmail.includes('@')) errors.push('El email de contacto debe ser válido.');
    if (!title.trim()) errors.push('El título del evento es obligatorio.');
    if (!date) errors.push('La fecha y hora son obligatorias.');
    if (!city) errors.push('La ciudad es obligatoria.');
    if (!venue.trim()) errors.push('El venue es obligatorio.');
    if (genres.length === 0) errors.push('Selecciona al menos un género musical.');
    const validArtists = lineUp.filter((a) => a.trim().length > 0);
    if (validArtists.length === 0) errors.push('Añade al menos un artista al lineup.');
    if (!eventType) errors.push('El tipo de evento es obligatorio.');
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validate();
    if (errors.length > 0) {
      setFormState({ phase: 'error', messages: errors });
      return;
    }

    setFormState({ phase: 'submitting' });

    const isoDate = new Date(date).toISOString();
    const validArtists = lineUp.filter((a) => a.trim().length > 0);
    const payload: Record<string, unknown> = {
      partnerName: partnerName.trim(),
      contactEmail: contactEmail.trim(),
      title: title.trim(),
      date: isoDate,
      city: city.trim(),
      venue: venue.trim(),
      genres,
      lineUp: validArtists,
      eventType,
    };
    if (description.trim()) payload.description = description.trim();
    if (priceEur.trim()) payload.priceEur = parseFloat(priceEur);
    if (ticketUrl.trim()) payload.ticketUrl = ticketUrl.trim();
    if (sourceRaUrl.trim()) payload.sourceRaUrl = sourceRaUrl.trim();

    try {
      const res = await fetch('/api/events/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const details: string[] = body?.details ?? [`Error ${res.status}`];
        setFormState({ phase: 'error', messages: details });
        return;
      }

      const body = await res.json();
      const id: string = body?.data?.id ?? 'SUBMITTED';
      setFormState({ phase: 'success', identifier: id });
    } catch {
      setFormState({ phase: 'error', messages: ['Error de red. Inténtalo de nuevo.'] });
    }
  }

  if (formState.phase === 'success') {
    return (
      <div className="space-y-8">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="font-display text-[clamp(2.6rem,6vw,5.5rem)] font-black uppercase leading-none tracking-[-0.03em]">
            Solicitud enviada
          </h1>
          <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-muted">
            Hemos recibido tu solicitud correctamente.
          </p>
        </header>

        <div className="border border-border bg-surface p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.15),transparent_50%)]" />
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.26em] text-accent">
            Referencia
          </p>
          <p className="mt-2 font-display text-lg font-black uppercase">{formState.identifier}</p>
          <p className="mt-4 text-sm text-muted">
            El equipo de Cooldown revisará tu propuesta y se pondrá en contacto contigo a través del email de contacto
            proporcionado. El estado de tu solicitud quedará en{' '}
            <span className="font-semibold text-foreground">Pending Review</span>.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events"
              className="inline-flex items-center border border-border px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
            >
              Ver agenda
            </Link>
            <button
              type="button"
              onClick={() => {
                setFormState({ phase: 'idle' });
                setPartnerName('');
                setContactEmail('');
                setTitle('');
                setDescription('');
                setDate('');
                setCity('');
                setVenue('');
                setGenres([]);
                setLineUp(['']);
                setEventType('');
                setPriceEur('');
                setTicketUrl('');
                setSourceRaUrl('');
              }}
              className="inline-flex items-center bg-accent px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground"
            >
              Enviar otro evento
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="font-display text-[clamp(2.6rem,6vw,5.5rem)] font-black uppercase leading-none tracking-[-0.03em]">
          Submit Event
        </h1>
        <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-muted">
          ¿Organizas una sesión, showcase o pop-up en Barcelona o Madrid? Envíanos los detalles y el equipo de Cooldown
          revisará tu propuesta para publicarla en la agenda.
        </p>
      </header>

      {formState.phase === 'error' && (
        <div className="border border-accent-2/60 bg-accent-2/10 p-4">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-red-300">
            Corrige los siguientes errores
          </p>
          <ul className="mt-2 space-y-1">
            {formState.messages.map((msg) => (
              <li key={msg} className="text-sm text-red-200">
                — {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <section className="space-y-5 border border-border bg-surface p-5">
          <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
            Datos del organizador
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="partnerName">Club / Promotor</FieldLabel>
              <TextInput
                id="partnerName"
                value={partnerName}
                onChange={setPartnerName}
                placeholder="Ej. Sala Prisma"
                required
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="contactEmail">Email de contacto</FieldLabel>
              <TextInput
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={setContactEmail}
                placeholder="booking@ejemplo.com"
                required
              />
            </div>
          </div>
        </section>

        <section className="space-y-5 border border-border bg-surface p-5">
          <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
            Detalles del evento
          </h2>

          <div className="space-y-2">
            <FieldLabel htmlFor="title">Título del evento</FieldLabel>
            <TextInput
              id="title"
              value={title}
              onChange={setTitle}
              placeholder="Ej. Radar Room 03"
              required
            />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="description" optional>Descripción</FieldLabel>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el evento, el concepto, el ambiente..."
              rows={4}
              className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/40 focus:border-accent focus:outline-none"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="date">Fecha y hora</FieldLabel>
              <input
                id="date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="city">Ciudad</FieldLabel>
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
              >
                <option value="" disabled>Selecciona ciudad</option>
                {CITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="venue">Venue</FieldLabel>
            <TextInput
              id="venue"
              value={venue}
              onChange={setVenue}
              placeholder="Ej. Nave Aurora"
              required
            />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="eventType">Tipo de evento</FieldLabel>
            <select
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType | '')}
              required
              className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              <option value="" disabled>Selecciona tipo</option>
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-5 border border-border bg-surface p-5">
          <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
            Géneros musicales
          </h2>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => {
              const active = genres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  aria-pressed={active}
                  className={`inline-flex items-center border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                    active
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border hover:border-accent hover:text-accent'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
          {genres.length > 0 && (
            <p className="text-xs text-muted">
              Seleccionados: {genres.join(', ')}
            </p>
          )}
        </section>

        <section className="space-y-5 border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
              Lineup
            </h2>
            <button
              type="button"
              onClick={addArtist}
              className="inline-flex items-center border border-border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
            >
              + Añadir artista
            </button>
          </div>
          <div className="space-y-2">
            {lineUp.map((artist, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => updateArtist(index, e.target.value)}
                  placeholder={`Artista ${index + 1}`}
                  className="flex-1 border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/40 focus:border-accent focus:outline-none"
                />
                {lineUp.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArtist(index)}
                    className="border border-border px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent-2/60 hover:text-red-300"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5 border border-border bg-surface p-5">
          <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
            Info adicional
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="priceEur" optional>Precio (EUR)</FieldLabel>
              <input
                id="priceEur"
                type="number"
                min="0"
                step="0.01"
                value={priceEur}
                onChange={(e) => setPriceEur(e.target.value)}
                placeholder="Ej. 12.00"
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/40 focus:border-accent focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="ticketUrl" optional>URL de entradas</FieldLabel>
              <TextInput
                id="ticketUrl"
                type="url"
                value={ticketUrl}
                onChange={setTicketUrl}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="sourceRaUrl" optional>URL del evento en Resident Advisor</FieldLabel>
            <TextInput
              id="sourceRaUrl"
              type="url"
              value={sourceRaUrl}
              onChange={setSourceRaUrl}
              placeholder="https://ra.co/events/..."
            />
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={formState.phase === 'submitting'}
            className="inline-flex items-center bg-accent px-6 py-3 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground transition-opacity disabled:opacity-60"
          >
            {formState.phase === 'submitting' ? 'Enviando...' : 'Enviar solicitud'}
          </button>
          <Link
            href="/events"
            className="inline-flex items-center border border-border px-6 py-3 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Cancelar
          </Link>
          <p className="text-xs text-muted">
            Tu solicitud quedará en estado{' '}
            <span className="font-semibold text-foreground">Pending Review</span> hasta su revisión.
          </p>
        </div>

        <p className="text-xs text-muted">
          ¿Primera vez?{' '}
          <Link
            href="/partners/join"
            className="font-semibold text-foreground underline-offset-2 hover:underline"
          >
            Regístrate primero como partner →
          </Link>
        </p>
      </form>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';

type FormState =
  | { phase: 'idle' }
  | { phase: 'submitting' }
  | { phase: 'success'; partnerName: string; slug: string }
  | { phase: 'error'; messages: string[] };

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted"
    >
      {children}
      {optional && (
        <span className="ml-2 font-normal normal-case tracking-normal text-muted/50">optional</span>
      )}
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

export default function PartnersJoinPage() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [raProfileUrl, setRaProfileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [formState, setFormState] = useState<FormState>({ phase: 'idle' });

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setSlug(slugify(value));
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (!name.trim()) errors.push('El nombre del club/marca/empresa es obligatorio.');
    if (!slug.trim()) errors.push('El slug es obligatorio.');
    if (!contactEmail.trim() || !contactEmail.includes('@'))
      errors.push('El email de contacto debe ser válido.');
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

    const payload: Record<string, unknown> = {
      name: name.trim(),
      slug: slug.trim(),
      contactEmail: contactEmail.trim(),
    };
    if (raProfileUrl.trim()) payload.raProfileUrl = raProfileUrl.trim();
    if (description.trim()) payload.description = description.trim();

    try {
      const res = await fetch('/api/events/partners', {
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
      const partnerSlug: string = body?.data?.slug ?? slug.trim();
      const partnerName: string = body?.data?.name ?? name.trim();
      setFormState({ phase: 'success', partnerName, slug: partnerSlug });
    } catch {
      setFormState({ phase: 'error', messages: ['Error de red. Inténtalo de nuevo.'] });
    }
  }

  if (formState.phase === 'success') {
    return (
      <div className="space-y-8">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="font-display text-[clamp(2.6rem,6vw,5.5rem)] font-black uppercase leading-none tracking-[-0.03em]">
            Registro completado
          </h1>
          <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-muted">
            Tu perfil de partner ha sido creado correctamente.
          </p>
        </header>

        <div className="relative border border-border bg-surface p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.15),transparent_50%)]" />
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.26em] text-accent">
            Partner registrado
          </p>
          <p className="mt-2 font-display text-lg font-black uppercase">{formState.partnerName}</p>
          <p className="mt-1 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            /{formState.slug}
          </p>
          <p className="mt-4 text-sm text-muted">
            Ya puedes enviar solicitudes de eventos. Usa el mismo email de contacto al enviar
            tu primera propuesta.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events/submit"
              className="inline-flex items-center bg-accent px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground"
            >
              Enviar evento →
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center border border-border px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
            >
              Ver agenda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="font-display text-[clamp(2.6rem,6vw,5.5rem)] font-black uppercase leading-none tracking-[-0.03em]">
          Hazte Partner
        </h1>
        <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-muted">
          Clubs, marcas y promotores pueden registrarse como partners de Cooldown para enviar
          solicitudes de eventos y aparecer en la agenda.
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
            Identidad
          </h2>

          <div className="space-y-2">
            <FieldLabel htmlFor="name">Nombre del club / marca / empresa</FieldLabel>
            <TextInput
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Ej. Sala Prisma"
              required
            />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="slug">Slug (identificador único)</FieldLabel>
            <div className="flex items-center gap-0">
              <span className="inline-flex h-full items-center border border-r-0 border-border bg-surface px-3 py-2 font-display text-[11px] text-muted">
                /partners/
              </span>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="sala-prisma"
                required
                className="flex-1 border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/40 focus:border-accent focus:outline-none"
              />
            </div>
            <p className="text-xs text-muted/60">
              Se genera automáticamente desde el nombre. Solo letras, números y guiones.
            </p>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="description" optional>
              Descripción breve
            </FieldLabel>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cuéntanos quiénes sois, vuestro sonido, el espacio..."
              rows={3}
              className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/40 focus:border-accent focus:outline-none"
            />
          </div>
        </section>

        <section className="space-y-5 border border-border bg-surface p-5">
          <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
            Contacto
          </h2>

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
            <p className="text-xs text-muted/60">
              Usa este mismo email al enviar solicitudes de evento.
            </p>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="raProfileUrl" optional>
              Perfil en Resident Advisor
            </FieldLabel>
            <TextInput
              id="raProfileUrl"
              type="url"
              value={raProfileUrl}
              onChange={setRaProfileUrl}
              placeholder="https://ra.co/clubs/..."
            />
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={formState.phase === 'submitting'}
            className="inline-flex items-center bg-accent px-6 py-3 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground transition-opacity disabled:opacity-60"
          >
            {formState.phase === 'submitting' ? 'Registrando...' : 'Registrarme como partner'}
          </button>
          <Link
            href="/events"
            className="inline-flex items-center border border-border px-6 py-3 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

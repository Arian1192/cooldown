'use client';

import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';

type FormState = {
  partnerName: string;
  contactEmail: string;
  title: string;
  description: string;
  date: string;
  city: string;
  venue: string;
  eventType: 'club_night' | 'showcase' | 'pop_up' | 'workshop';
  genres: string;
  lineUp: string;
  ticketUrl: string;
  priceEur: string;
  sourceRaUrl: string;
  logoAssetUrl: string;
  artworkAssetUrl: string;
  rightsConfirmed: boolean;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_STATE: FormState = {
  partnerName: '',
  contactEmail: '',
  title: '',
  description: '',
  date: '',
  city: '',
  venue: '',
  eventType: 'club_night',
  genres: '',
  lineUp: '',
  ticketUrl: '',
  priceEur: '',
  sourceRaUrl: '',
  logoAssetUrl: '',
  artworkAssetUrl: '',
  rightsConfirmed: false,
};

function parseCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLineUp(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function toIsoDateFromInput(datetimeLocal: string): string {
  return new Date(datetimeLocal).toISOString();
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  const genres = parseCsv(form.genres);
  const lineUp = parseLineUp(form.lineUp);

  if (!form.partnerName.trim()) errors.partnerName = 'Partner name is required.';
  if (!form.contactEmail.trim() || !form.contactEmail.includes('@')) {
    errors.contactEmail = 'Valid contact email is required.';
  }
  if (!form.title.trim()) errors.title = 'Event title is required.';
  if (!form.date.trim()) {
    errors.date = 'Date/time is required.';
  } else if (Number.isNaN(new Date(form.date).getTime())) {
    errors.date = 'Date/time is invalid.';
  }
  if (!form.city.trim()) errors.city = 'City is required.';
  if (!form.venue.trim()) errors.venue = 'Venue is required.';
  if (genres.length < 1) errors.genres = 'At least one genre is required.';
  if (lineUp.length < 1) errors.lineUp = 'At least one lineup artist is required.';
  if (!form.logoAssetUrl.trim() || !isHttpUrl(form.logoAssetUrl.trim())) {
    errors.logoAssetUrl = 'Logo URL must be a valid http/https link.';
  }
  if (!form.artworkAssetUrl.trim() || !isHttpUrl(form.artworkAssetUrl.trim())) {
    errors.artworkAssetUrl = 'Artwork URL must be a valid http/https link.';
  }
  if (form.ticketUrl.trim() && !isHttpUrl(form.ticketUrl.trim())) {
    errors.ticketUrl = 'Ticket URL must be valid.';
  }
  if (form.sourceRaUrl.trim() && !isHttpUrl(form.sourceRaUrl.trim())) {
    errors.sourceRaUrl = 'Resident Advisor URL must be valid.';
  }
  if (!form.rightsConfirmed) {
    errors.rightsConfirmed = 'You must confirm media rights ownership.';
  }

  return errors;
}

function buildPayload(form: FormState) {
  return {
    partnerName: form.partnerName.trim(),
    contactEmail: form.contactEmail.trim(),
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    date: toIsoDateFromInput(form.date),
    city: form.city.trim(),
    venue: form.venue.trim(),
    eventType: form.eventType,
    genres: parseCsv(form.genres),
    lineUp: parseLineUp(form.lineUp),
    ticketUrl: form.ticketUrl.trim() || undefined,
    priceEur: form.priceEur.trim() ? Number(form.priceEur.trim()) : undefined,
    sourceRaUrl: form.sourceRaUrl.trim() || undefined,
    logoAssetUrl: form.logoAssetUrl.trim(),
    artworkAssetUrl: form.artworkAssetUrl.trim(),
    rightsConfirmed: form.rightsConfirmed,
  };
}

export function PartnerEventSubmitForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [autofillMessage, setAutofillMessage] = useState<string | null>(null);

  const errorList = useMemo(
    () => Object.entries(errors).filter(([, value]) => Boolean(value)) as [keyof FormState, string][],
    [errors],
  );

  async function handleAutofill() {
    if (!form.sourceRaUrl.trim()) {
      setErrors((prev) => ({ ...prev, sourceRaUrl: 'Paste a Resident Advisor URL first.' }));
      return;
    }

    if (!isHttpUrl(form.sourceRaUrl.trim())) {
      setErrors((prev) => ({ ...prev, sourceRaUrl: 'Resident Advisor URL must be valid.' }));
      return;
    }

    setIsAutofilling(true);
    setAutofillMessage(null);
    setServerError(null);

    try {
      const response = await fetch('/api/events/import/ra?preview=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: form.sourceRaUrl.trim(),
          organizer: form.partnerName.trim() || undefined,
        }),
      });

      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
        data?: {
          title?: string;
          date?: string;
          city?: string;
          venue?: string;
          genres?: string[];
          lineUp?: string[];
          priceEur?: number;
        };
      };

      if (!response.ok || !json.data) {
        setServerError(json.error ?? 'Could not autofill from Resident Advisor URL.');
        return;
      }

      const parsedDate = json.data.date ? new Date(json.data.date) : null;
      const asDateInput =
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
          : '';

      setForm((prev) => ({
        ...prev,
        title: prev.title || json.data?.title || '',
        date: prev.date || asDateInput,
        city: prev.city || json.data?.city || '',
        venue: prev.venue || json.data?.venue || '',
        genres: prev.genres || (json.data?.genres ?? []).join(', '),
        lineUp: prev.lineUp || (json.data?.lineUp ?? []).join('\n'),
        priceEur: prev.priceEur || (json.data?.priceEur != null ? String(json.data.priceEur) : ''),
      }));

      setAutofillMessage('Fields were prefilled from Resident Advisor data.');
    } catch {
      setServerError('Could not autofill right now. Try again in a moment.');
    } finally {
      setIsAutofilling(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    setServerError(null);

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/events/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(form)),
      });

      const json = (await response.json().catch(() => ({}))) as {
        error?: string;
        details?: string[];
      };

      if (!response.ok) {
        const details = Array.isArray(json.details) ? json.details.join(' ') : '';
        setServerError([json.error, details].filter(Boolean).join(' · ') || 'Submission failed.');
        return;
      }

      setForm(INITIAL_STATE);
      setErrors({});
      setAutofillMessage(null);
      setSuccessMessage('Event request submitted. Your request is now visible in moderation queue.');
    } catch {
      setServerError('Network error while submitting. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorList.length > 0 ? (
        <div role="alert" className="border border-red-400/60 bg-red-950/30 p-4 text-sm text-red-100">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em]">Fix these fields</p>
          <ul className="mt-2 space-y-1">
            {errorList.map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {serverError ? (
        <div role="alert" className="border border-red-400/60 bg-red-950/30 p-4 text-sm text-red-100">
          {serverError}
        </div>
      ) : null}

      {successMessage ? (
        <div role="status" className="border border-lime-400/60 bg-lime-950/20 p-4 text-sm text-lime-100">
          {successMessage}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Partner name" error={errors.partnerName}>
          <input
            value={form.partnerName}
            onChange={(event) => setForm((prev) => ({ ...prev, partnerName: event.target.value }))}
            className="w-full border border-border bg-background px-3 py-2 text-sm"
            autoComplete="organization"
          />
        </Field>
        <Field label="Contact email" error={errors.contactEmail}>
          <input
            type="email"
            value={form.contactEmail}
            onChange={(event) => setForm((prev) => ({ ...prev, contactEmail: event.target.value }))}
            className="w-full border border-border bg-background px-3 py-2 text-sm"
            autoComplete="email"
          />
        </Field>
      </section>

      <section className="space-y-4">
        <Field label="Resident Advisor link (optional)" error={errors.sourceRaUrl}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={form.sourceRaUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, sourceRaUrl: event.target.value }))}
              placeholder="https://ra.co/events/..."
              className="w-full border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleAutofill}
              disabled={isAutofilling}
              className="inline-flex shrink-0 items-center justify-center border border-border px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
            >
              {isAutofilling ? 'Loading...' : 'Autofill from RA'}
            </button>
          </div>
          {autofillMessage ? <p className="mt-1 text-xs text-accent">{autofillMessage}</p> : null}
        </Field>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Event title" error={errors.title}>
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Event type" error={errors.eventType}>
          <select
            value={form.eventType}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, eventType: event.target.value as FormState['eventType'] }))
            }
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="club_night">Club Night</option>
            <option value="showcase">Showcase</option>
            <option value="pop_up">Pop-up</option>
            <option value="workshop">Workshop</option>
          </select>
        </Field>
        <Field label="Date and time" error={errors.date}>
          <input
            type="datetime-local"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Venue" error={errors.venue}>
          <input
            value={form.venue}
            onChange={(event) => setForm((prev) => ({ ...prev, venue: event.target.value }))}
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="City" error={errors.city}>
          <input
            value={form.city}
            onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Genres (comma separated)" error={errors.genres}>
          <input
            value={form.genres}
            onChange={(event) => setForm((prev) => ({ ...prev, genres: event.target.value }))}
            placeholder="techno, electro, ambient"
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
      </section>

      <Field label="Lineup (one artist per line)" error={errors.lineUp}>
        <textarea
          value={form.lineUp}
          onChange={(event) => setForm((prev) => ({ ...prev, lineUp: event.target.value }))}
          rows={5}
          className="w-full border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Description (optional)" error={errors.description}>
        <textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          rows={3}
          className="w-full border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Ticket URL (optional)" error={errors.ticketUrl}>
          <input
            value={form.ticketUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, ticketUrl: event.target.value }))}
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Price EUR (optional)" error={errors.priceEur}>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.priceEur}
            onChange={(event) => setForm((prev) => ({ ...prev, priceEur: event.target.value }))}
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Partner logo URL" error={errors.logoAssetUrl}>
          <input
            value={form.logoAssetUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, logoAssetUrl: event.target.value }))}
            placeholder="https://cdn.example.com/partner-logo.jpg"
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Event artwork URL" error={errors.artworkAssetUrl}>
          <input
            value={form.artworkAssetUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, artworkAssetUrl: event.target.value }))}
            placeholder="https://cdn.example.com/event-artwork.jpg"
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
      </section>

      <label className="flex items-start gap-3 border border-border bg-surface p-3 text-sm">
        <input
          type="checkbox"
          checked={form.rightsConfirmed}
          onChange={(event) => setForm((prev) => ({ ...prev, rightsConfirmed: event.target.checked }))}
          className="mt-1"
        />
        <span>
          I confirm I own rights for provided media and event information.
          {errors.rightsConfirmed ? <span className="mt-1 block text-xs text-red-200">{errors.rightsConfirmed}</span> : null}
        </span>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center bg-accent px-5 py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Event Request'}
        </button>
        <button
          type="button"
          onClick={() => {
            setForm(INITIAL_STATE);
            setErrors({});
            setServerError(null);
            setSuccessMessage(null);
            setAutofillMessage(null);
          }}
          className="inline-flex items-center border border-border px-5 py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-200">{error}</span> : null}
    </label>
  );
}

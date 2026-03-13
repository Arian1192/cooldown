'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Card } from '@/components/ui/Card';
import type { EventRequestRecord } from '@/lib/events/types';

type StatusFilter = 'all' | EventRequestRecord['status'];
type ActionType = 'approve' | 'reject' | 'edit';

interface RequestsResponse {
  data?: EventRequestRecord[];
}

interface ModeratePayload {
  action: ActionType;
  moderationNotes?: string;
  patch?: Record<string, unknown>;
}

interface SessionAuditEntry {
  requestId: string;
  action: ActionType;
  actor: string;
  at: string;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending_review', label: 'Pending review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function statusPillClass(status: EventRequestRecord['status']): string {
  if (status === 'approved') {
    return 'border-accent bg-accent/10 text-accent';
  }

  if (status === 'rejected') {
    return 'border-accent-2 bg-accent-2/10 text-accent-2';
  }

  return 'border-border bg-foreground/5 text-foreground';
}

function statusLabel(status: EventRequestRecord['status']): string {
  if (status === 'pending_review') return 'Pending review';
  if (status === 'approved') return 'Approved';
  return 'Rejected';
}

function actionLabel(action: ActionType): string {
  if (action === 'approve') return 'Approved + published';
  if (action === 'reject') return 'Rejected';
  return 'Edited';
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatRequestDate(value: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function pickPatchFromDraft(draft: EditDraft, request: EventRequestRecord): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  if (draft.title !== request.title) patch.title = draft.title;
  if (draft.description !== (request.description ?? '')) patch.description = draft.description || undefined;
  if (draft.date !== request.date) patch.date = draft.date;
  if (draft.city !== request.city) patch.city = draft.city;
  if (draft.venue !== request.venue) patch.venue = draft.venue;
  if (draft.eventType !== request.eventType) patch.eventType = draft.eventType;

  const nextGenres = draft.genres
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean);

  if (JSON.stringify(nextGenres) !== JSON.stringify(request.genres)) {
    patch.genres = nextGenres;
  }

  const nextLineUp = draft.lineUp
    .split(',')
    .map((artist) => artist.trim())
    .filter(Boolean);

  if (JSON.stringify(nextLineUp) !== JSON.stringify(request.lineUp)) {
    patch.lineUp = nextLineUp;
  }

  const normalizedPrice = draft.priceEur.trim();
  const currentPrice = request.priceEur;

  if (!normalizedPrice && currentPrice !== undefined) {
    patch.priceEur = undefined;
  } else if (normalizedPrice) {
    const parsed = Number(normalizedPrice);
    if (!Number.isNaN(parsed) && parsed !== currentPrice) {
      patch.priceEur = parsed;
    }
  }

  if (draft.ticketUrl !== (request.ticketUrl ?? '')) {
    patch.ticketUrl = draft.ticketUrl || undefined;
  }

  return patch;
}

function extractRequestFromModerationResponse(payload: unknown): EventRequestRecord | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const data = (payload as { data?: unknown }).data;

  if (!data || typeof data !== 'object') {
    return null;
  }

  if ('request' in data) {
    const requestCandidate = (data as { request?: unknown }).request;
    if (requestCandidate && typeof requestCandidate === 'object') {
      return requestCandidate as EventRequestRecord;
    }
  }

  return data as EventRequestRecord;
}

interface EditDraft {
  title: string;
  description: string;
  date: string;
  city: string;
  venue: string;
  eventType: EventRequestRecord['eventType'];
  genres: string;
  lineUp: string;
  priceEur: string;
  ticketUrl: string;
}

function createEditDraft(request: EventRequestRecord): EditDraft {
  return {
    title: request.title,
    description: request.description ?? '',
    date: request.date,
    city: request.city,
    venue: request.venue,
    eventType: request.eventType,
    genres: request.genres.join(', '),
    lineUp: request.lineUp.join(', '),
    priceEur: request.priceEur === undefined ? '' : String(request.priceEur),
    ticketUrl: request.ticketUrl ?? '',
  };
}

export function ModerationBackoffice() {
  const [requests, setRequests] = useState<EventRequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [submittingAction, setSubmittingAction] = useState<ActionType | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [auditEntries, setAuditEntries] = useState<SessionAuditEntry[]>([]);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/events/requests', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`API responded ${response.status}`);
      }

      const payload = (await response.json()) as RequestsResponse;
      const nextRequests = Array.isArray(payload.data) ? payload.data : [];
      setRequests(nextRequests);

      if (selectedRequestId && !nextRequests.some((request) => request.id === selectedRequestId)) {
        setSelectedRequestId(null);
        setEditDraft(null);
      }
    } catch {
      setError('No se pudo cargar la cola de solicitudes. Reintenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedRequestId]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const partnerOptions = useMemo(() => {
    const unique = new Set(requests.map((request) => request.partnerName));
    return ['all', ...Array.from(unique).sort((a, b) => a.localeCompare(b, 'es'))];
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (statusFilter !== 'all' && request.status !== statusFilter) {
        return false;
      }

      if (partnerFilter !== 'all' && request.partnerName !== partnerFilter) {
        return false;
      }

      if (dateFrom && request.date < dateFrom) {
        return false;
      }

      if (dateTo && request.date > dateTo) {
        return false;
      }

      return true;
    });
  }, [dateFrom, dateTo, partnerFilter, requests, statusFilter]);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) ?? null,
    [requests, selectedRequestId],
  );

  useEffect(() => {
    if (!selectedRequest) {
      setModerationNotes('');
      setEditDraft(null);
      return;
    }

    setModerationNotes(selectedRequest.moderationNotes ?? '');
    setEditDraft(createEditDraft(selectedRequest));
  }, [selectedRequest]);

  const updateRequestInState = useCallback((nextRequest: EventRequestRecord) => {
    setRequests((current) =>
      current.map((request) => (request.id === nextRequest.id ? nextRequest : request)),
    );
  }, []);

  const submitModerationAction = useCallback(
    async (action: ActionType) => {
      if (!selectedRequest) {
        return;
      }

      setSubmittingAction(action);
      setActionError(null);

      const payload: ModeratePayload = {
        action,
        moderationNotes: moderationNotes.trim() || undefined,
      };

      if (action === 'edit') {
        if (!editDraft) {
          setActionError('No hay cambios para guardar.');
          setSubmittingAction(null);
          return;
        }

        const patch = pickPatchFromDraft(editDraft, selectedRequest);

        if (Object.keys(patch).length === 0) {
          setActionError('No se detectaron cambios en la propuesta.');
          setSubmittingAction(null);
          return;
        }

        payload.patch = patch;
      }

      try {
        const response = await fetch(`/api/events/requests/${selectedRequest.id}/moderate`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const body = (await response.json().catch(() => null)) as unknown;

        if (!response.ok) {
          throw new Error(
            typeof body === 'object' && body && 'error' in body
              ? String((body as { error?: unknown }).error)
              : 'Moderation API failed',
          );
        }

        const updatedRequest = extractRequestFromModerationResponse(body);

        if (updatedRequest) {
          updateRequestInState(updatedRequest);
          setEditDraft(createEditDraft(updatedRequest));
        }

        setAuditEntries((current) => [
          {
            requestId: selectedRequest.id,
            action,
            actor: 'Operador interno',
            at: new Date().toISOString(),
          },
          ...current,
        ].slice(0, 10));
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'No se pudo completar la moderacion.';
        setActionError(`${message}. Puedes corregir y reintentar.`);
      } finally {
        setSubmittingAction(null);
      }
    },
    [editDraft, moderationNotes, selectedRequest, updateRequestInState],
  );

  return (
    <section className="space-y-6">
      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              Partner
            </span>
            <select
              value={partnerFilter}
              onChange={(event) => setPartnerFilter(event.target.value)}
              className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
            >
              {partnerOptions.map((partnerName) => (
                <option key={partnerName} value={partnerName}>
                  {partnerName === 'all' ? 'All partners' : partnerName}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              Date from
            </span>
            <input
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              type="date"
              className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
            />
          </label>

          <label className="space-y-1">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              Date to
            </span>
            <input
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              type="date"
              className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
            Queue size: {filteredRequests.length} / {requests.length}
          </p>
          <button
            onClick={() => void fetchRequests()}
            type="button"
            className="border border-border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Refresh queue
          </button>
        </div>
      </Card>

      {auditEntries.length > 0 ? (
        <Card className="p-4 sm:p-5">
          <h2 className="font-display text-sm font-black uppercase tracking-[0.14em]">Session audit</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {auditEntries.map((entry) => (
              <li key={`${entry.requestId}-${entry.at}`} className="border border-border bg-background p-2">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                  {entry.actor} · {formatDateTime(entry.at)}
                </p>
                <p className="mt-1">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                    {actionLabel(entry.action)}
                  </span>{' '}
                  on request <span className="font-mono text-xs">{entry.requestId}</span>
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {error ? (
        <Card className="border-accent-2/60 bg-accent-2/10 p-4 text-sm text-accent-2">
          {error}
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr),minmax(0,1.1fr)]">
        <Card className="p-4 sm:p-5">
          <h2 className="font-display text-sm font-black uppercase tracking-[0.14em]">Review queue</h2>

          {isLoading ? (
            <p className="mt-4 text-sm text-muted">Cargando solicitudes...</p>
          ) : filteredRequests.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No hay resultados con los filtros actuales.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {filteredRequests.map((request) => {
                const isSelected = request.id === selectedRequestId;

                return (
                  <li key={request.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedRequestId(request.id)}
                      className={[
                        'w-full border p-3 text-left transition-colors',
                        isSelected
                          ? 'border-accent bg-accent/8'
                          : 'border-border bg-background hover:border-accent/40',
                      ].join(' ')}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-display text-sm font-black uppercase leading-tight tracking-[0.08em]">
                          {request.title}
                        </p>
                        <span
                          className={[
                            'border px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.18em]',
                            statusPillClass(request.status),
                          ].join(' ')}
                        >
                          {statusLabel(request.status)}
                        </span>
                      </div>

                      <p className="mt-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                        {request.partnerName} · {formatRequestDate(request.date)} · {request.city}
                      </p>

                      <p className="mt-2 line-clamp-2 text-sm text-muted">
                        {request.description ?? 'No description provided'}
                      </p>

                      <p className="mt-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                        Updated: {formatDateTime(request.updatedAt)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-4 sm:p-5">
          <h2 className="font-display text-sm font-black uppercase tracking-[0.14em]">Moderation panel</h2>

          {!selectedRequest || !editDraft ? (
            <p className="mt-4 text-sm text-muted">Selecciona una solicitud para revisar.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 sm:col-span-2">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                    Event title
                  </span>
                  <input
                    value={editDraft.title}
                    onChange={(event) => setEditDraft((current) => current ? { ...current, title: event.target.value } : current)}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
                  />
                </label>

                <label className="space-y-1 sm:col-span-2">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                    Description
                  </span>
                  <textarea
                    value={editDraft.description}
                    onChange={(event) => setEditDraft((current) => current ? { ...current, description: event.target.value } : current)}
                    rows={4}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                    Date
                  </span>
                  <input
                    value={editDraft.date}
                    onChange={(event) => setEditDraft((current) => current ? { ...current, date: event.target.value } : current)}
                    type="date"
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                    City
                  </span>
                  <input
                    value={editDraft.city}
                    onChange={(event) => setEditDraft((current) => current ? { ...current, city: event.target.value } : current)}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                    Venue
                  </span>
                  <input
                    value={editDraft.venue}
                    onChange={(event) => setEditDraft((current) => current ? { ...current, venue: event.target.value } : current)}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                    Event type
                  </span>
                  <select
                    value={editDraft.eventType}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, eventType: event.target.value as EventRequestRecord['eventType'] } : current,
                      )
                    }
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
                  >
                    <option value="club_night">Club night</option>
                    <option value="showcase">Showcase</option>
                    <option value="pop_up">Pop up</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                    Ticket URL
                  </span>
                  <input
                    value={editDraft.ticketUrl}
                    onChange={(event) => setEditDraft((current) => current ? { ...current, ticketUrl: event.target.value } : current)}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                    Genres
                  </span>
                  <input
                    value={editDraft.genres}
                    onChange={(event) => setEditDraft((current) => current ? { ...current, genres: event.target.value } : current)}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                    Line up
                  </span>
                  <input
                    value={editDraft.lineUp}
                    onChange={(event) => setEditDraft((current) => current ? { ...current, lineUp: event.target.value } : current)}
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                    Price EUR
                  </span>
                  <input
                    value={editDraft.priceEur}
                    onChange={(event) => setEditDraft((current) => current ? { ...current, priceEur: event.target.value } : current)}
                    inputMode="decimal"
                    className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
                  />
                </label>
              </div>

              <label className="space-y-1">
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                  Moderation notes (audit)
                </span>
                <textarea
                  value={moderationNotes}
                  onChange={(event) => setModerationNotes(event.target.value)}
                  rows={3}
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-accent"
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => void submitModerationAction('edit')}
                  disabled={submittingAction !== null}
                  className="border border-border px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingAction === 'edit' ? 'Saving...' : 'Save edit'}
                </button>
                <button
                  type="button"
                  onClick={() => void submitModerationAction('reject')}
                  disabled={submittingAction !== null}
                  className="border border-accent-2 px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent-2 transition-colors hover:bg-accent-2/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingAction === 'reject' ? 'Rejecting...' : 'Reject request'}
                </button>
                <button
                  type="button"
                  onClick={() => void submitModerationAction('approve')}
                  disabled={submittingAction !== null}
                  className="bg-accent px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingAction === 'approve' ? 'Approving...' : 'Approve + publish'}
                </button>
              </div>

              {actionError ? (
                <p className="border border-accent-2/60 bg-accent-2/10 p-2 text-sm text-accent-2">{actionError}</p>
              ) : null}

              <div className="border-t border-border pt-3 text-sm text-muted">
                <p>
                  Last backend update: {formatDateTime(selectedRequest.updatedAt)}
                </p>
                <p>
                  Linked event id: {selectedRequest.linkedEventId ?? 'Not published yet'}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}

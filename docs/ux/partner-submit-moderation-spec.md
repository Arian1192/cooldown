# COO-70 UX/UI Spec: Partner Submit + Backoffice Moderation

## 1) Objetivo

Definir el flujo end-to-end para que partners (clubs/marcas) puedan enviar eventos, el equipo de Cooldown los modere, y los eventos aprobados se publiquen en `/events` con etiquetado de origen consistente (`Partner Event`).

## 2) Roles

- Partner submitter: crea solicitudes de evento.
- Moderator (equipo interno): revisa, aprueba, rechaza o solicita cambios.
- Visitante público: consume eventos ya publicados en `/events`.

## 3) User Journeys

### 3.1 Partner submit

1. Partner entra a "Submit Event".
2. Completa formulario en 3 bloques: `Event Basics`, `Line-up & Genre`, `Assets & Tickets`.
3. Envía solicitud.
4. Ve estado de éxito con `requestId` y expectativa de respuesta.
5. Recibe resolución: `approved` o `rejected` (con motivo).

### 3.2 Moderación interna

1. Moderador abre inbox de solicitudes `pending_review`.
2. Revisa checklist de calidad (datos mínimos, coherencia, tono editorial, assets).
3. Decide:
- `approve`: pasa a publicado y visible en `/events`.
- `reject`: requiere motivo estructurado + nota opcional.
- `request_changes` (si se implementa): mantiene draft editable por partner.
4. El sistema registra auditoría: actor, fecha, decisión, motivo.

### 3.3 Publicación

1. Evento aprobado se transforma en `Event` público.
2. En `/events` debe mostrar `origin = partner_event`.
3. Hereda filtros de organizador/fecha/género existentes.

## 4) Arquitectura de pantallas y estados

## 4.1 Pantalla: Partner submit form

Secciones:
- Header: título + microcopy de SLA (por ejemplo, "respuesta en 48h").
- Stepper de progreso (3 pasos).
- Form principal con validación inline.
- Sidebar (desktop) con guía de contenido y preview textual.

Estados críticos:
- Empty: primer acceso, CTA primario "Start submission".
- Loading: skeleton en campos y botón deshabilitado.
- Error: bloque superior + errores por campo.
- Success: resumen enviado + `requestId` + CTA "Submit another".

Wireframe low-fi:

```text
+--------------------------------------------------------------+
| Submit an Event                               SLA: 48h       |
| [1 Basics] -- [2 Line-up] -- [3 Assets]                     |
+-------------------------------------+------------------------+
| Event title*                        | Content guide          |
| Organizer name*                     | - Use concrete line-up |
| City* [Barcelona v]                 | - Avoid all-caps spam  |
| Date*   Time*                       | - Upload 16:10 flyer   |
| Description*                        |                        |
| [Back]                      [Submit for review]              |
+-------------------------------------+------------------------+
```

## 4.2 Pantalla: Moderation queue (backoffice)

Secciones:
- Top filters: `status`, `city`, `date`, `organizer`.
- Lista de requests con prioridad visual (pendientes arriba).
- Panel detalle con:
- metadata de evento
- assets
- historial de cambios
- acciones de decisión

Estados críticos:
- Empty: "No pending requests".
- Loading: tabla + panel en skeleton.
- Error: retry + fallback copy.
- Reject success: toast + item sale de la cola activa.

Wireframe low-fi:

```text
+-------------------------------------------------------------------+
| Requests | status: Pending v | city: All v | date: Next 30 days v |
+------------------------------+------------------------------------+
| [list]                       | [detail panel]                     |
| - Prisma Vinyl Session       | Title, date, venue, line-up        |
| - Hangar Delta Night         | Description + assets preview       |
| - ...                        | QA checklist                       |
|                              | [Reject] [Approve & Publish]       |
+------------------------------+------------------------------------+
```

## 4.3 Pantalla: Reject with reason

Modal obligatorio para rechazo:
- `Reason category*` (taxonomy):
- missing_required_fields
- poor_asset_quality
- duplicate_event
- policy_mismatch
- `Partner message*` (mínimo 20 chars)
- `Internal note` (opcional)

Estado crítico:
- Error de guardado: no cerrar modal, preservar texto.

## 5) Reglas de contenido + jerarquía visual

## 5.1 Prioridad visual en formulario

1. Datos críticos: título, fecha/hora, venue, ciudad, organizer.
2. Credibilidad cultural: line-up, género, tipo de evento.
3. Conversión: URL tickets/RSVP + arte visual.
4. Contexto: descripción larga y notas opcionales.

## 5.2 Reglas de contenido para reducir fricción

- Campos obligatorios visibles con `*` desde el inicio.
- Helper text en lenguaje natural y con ejemplo real.
- Validaciones anticipadas (on blur), no solo al submit.
- Mensajes de error accionables: "Añade al menos 1 artista del line-up".
- No bloquear por formato estricto cuando puede normalizarse server-side.

## 5.3 Consistencia con diseño Cooldown

- Mantener identidad dark/editorial definida en `DESIGN.md`.
- CTAs primarios en `accent` (acid yellow).
- Etiqueta de origen pública: `Partner Event`.
- Sin introducir patrones visuales ajenos al sistema actual.

## 6) Componentes UX listos para handoff

- `SubmitEventPageShell`
- `SubmissionStepper`
- `PartnerEventFormSection`
- `InlineFieldError`
- `SubmissionSuccessState`
- `ModerationQueueTable`
- `ModerationRequestDetail`
- `RejectReasonModal`
- `DecisionAuditTimeline`

## 7) Requisitos de datos mínimos (UX contract)

Campos requeridos para permitir `approve`:
- title
- organizerName
- city
- startDateTime
- venueName
- lineup[] (min 1)
- genres[] (min 1)
- ticketUrl OR rsvpUrl
- coverImage (ratio recomendado 16:10)

## 8) Eventos y feedback de sistema

- On submit success: mensaje persistente + id de solicitud.
- On approve: notificación interna + transición a publicado.
- On reject: mensaje al partner con motivo estructurado.
- On moderation action failure: retry sin pérdida de contexto.

## 9) Riesgos de usabilidad y mitigación

- Riesgo: abandono por formulario largo.
- Mitigación: stepper, autosave draft, progreso visible.

- Riesgo: rechazos ambiguos generan frustración del partner.
- Mitigación: taxonomía de motivos + mensaje claro y accionable.

- Riesgo: datos incompletos llegan a moderación.
- Mitigación: validación previa de mínimos antes de enviar.

- Riesgo: inconsistencia editorial en eventos publicados.
- Mitigación: checklist de moderación y campos obligatorios para approve.

## 10) Acceptance UX (hándoff ingeniería)

- Spec cubre los 3 journeys: submit, moderación, publicación.
- Wireframes low-fi incluyen estados: empty/loading/error/success/reject.
- Reglas de contenido/jerarquía definidas para onboarding partner.
- Contrato UX de campos mínimos definido para decisiones de moderación.
- Riesgos clave y mitigaciones documentados.

## 11) Próxima iteración recomendada

- Prototipo clickable en Figma con:
- desktop: submit + moderation queue
- mobile: submit flow
- variantes de copy para errores y rechazo


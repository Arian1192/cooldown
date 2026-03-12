# UX Contract: Submit Event + Moderation Dashboard

## Scope
This document defines the end-to-end UX contract for:
- Partner-facing `Submit Event` flow.
- Internal moderation dashboard for review/publish decisions.
- Shared status, validation, and accessibility rules.

Goal: provide implementation-ready guidance for frontend and backend.

## Roles
- Partner: creates and edits their own event draft/submission.
- Moderator (Cooldown team): reviews, approves, rejects, or requests edits.

## Information Architecture
- Partner area:
  - `Submit Event` form (create/edit draft).
  - `Submission Status` view (timeline + latest moderator note).
- Internal area:
  - Moderation list (queue).
  - Moderation detail (full request + actions).

## Event Lifecycle
Statuses:
- `draft`: started but not submitted.
- `pending_review`: submitted, waiting for moderation.
- `changes_requested`: moderator asks for edits.
- `approved`: accepted and ready to publish.
- `rejected`: declined.
- `published`: visible on `/events`.

Allowed transitions:
- Partner: `draft -> pending_review`, `changes_requested -> pending_review`.
- Moderator: `pending_review -> approved`, `pending_review -> changes_requested`, `pending_review -> rejected`.
- Publishing system/moderator: `approved -> published`.

## Partner Flow (Submit Event)
1. Partner opens `Submit Event`.
2. Completes required fields; autosave writes draft every 10 seconds and on blur.
3. Submits request.
4. Sees confirmation state with expected SLA and current status.
5. Receives feedback if moderator requests changes or rejects.
6. Can resubmit when in `changes_requested`.

### Form Sections and Fields
| Section | Field | Type | Required | Validation |
|---|---|---|---|---|
| Basics | Event title | text | yes | 8-90 chars |
| Basics | Event type | select | yes | enum: `club_night`, `showcase`, `pop_up`, `workshop`, `festival`, `other` |
| Basics | Short description | textarea | yes | 40-300 chars |
| Schedule | Start date/time | datetime | yes | future date |
| Schedule | End date/time | datetime | yes | greater than start |
| Venue | Venue name | text | yes | 2-80 chars |
| Venue | Address | text | yes | 5-140 chars |
| Venue | City | text | yes | 2-60 chars |
| Line-up | Artists | token list | yes | min 1, max 20 entries |
| Music | Genres | multi-select | yes | min 1, max 5 |
| Tickets | Ticket URL | url | no | valid https URL |
| Tickets | Price range | text | no | 1-40 chars |
| Branding | Partner logo | image upload | yes | png/jpg/webp, max 4 MB |
| Branding | Event artwork | image upload | yes | png/jpg/webp, max 8 MB, min 1200x630 |
| Metadata | External source URL (RA optional) | url | no | valid https URL |
| Compliance | Rights confirmation checkbox | boolean | yes | must be checked |

### Validation and Feedback Rules
- Validate on blur and on submit.
- Inline field errors under each input.
- Error summary at top on submit failure with anchor links to invalid fields.
- Preserve all input on validation failure.
- Disable submit while upload is in progress.

## Submission Status UX
For each submission, show:
- Current badge (`pending_review`, `changes_requested`, etc.).
- Last updated timestamp.
- Moderator message block.
- Timeline of state changes.

Copy requirements:
- `pending_review`: "Your event is under review."
- `changes_requested`: "Please update the highlighted fields and resubmit."
- `approved`: "Approved. Publishing is next."
- `rejected`: "This request was rejected. See feedback below."

## Moderation Dashboard

### Queue Layout
- Table with columns:
  - Event title
  - Partner name
  - Event date
  - Submitted at
  - Status
  - Priority flag
- Quick filters:
  - Status
  - Date range
  - Genre
  - Event type
- Search by title/partner.

### Moderation Detail Layout
- Left column: full submission (read-only preview of partner data).
- Right sticky action panel:
  - `Approve`
  - `Request changes`
  - `Reject`
  - Optional internal note
- Required moderator note for `changes_requested` and `rejected`.

### Decision UX Rules
- Action confirmation modal for `Reject`.
- Optimistic lock message if another moderator already processed item.
- After action, keep moderator in queue with next pending item preselected.

## Accessibility Contract
- All fields have programmatic labels (`label` + `for` / `aria-labelledby`).
- Error state uses both color and text; inputs set `aria-invalid=true` when invalid.
- Error summary is focus-trapped on submit failure and announced via `aria-live="assertive"`.
- Keyboard-only flow supports full completion with visible focus indicator.
- File uploads include clear requirements in text, not only placeholders.
- Status badges include readable text and minimum contrast ratio 4.5:1 for label/body text.
- Modals trap focus and return focus to triggering action on close.

## API Contract Recommendations
Payload keys:
- `title`, `eventType`, `description`, `startAt`, `endAt`, `venueName`, `venueAddress`, `city`, `lineup[]`, `genres[]`, `ticketUrl`, `priceRange`, `logoAssetId`, `artworkAssetId`, `externalSourceUrl`, `rightsConfirmed`.
- `status`, `moderatorNote`, `submittedAt`, `reviewedAt`, `reviewedBy` for moderation lifecycle.

Backend should return field-level errors as:
```json
{
  "message": "Validation failed",
  "errors": {
    "title": "Title must be between 8 and 90 characters",
    "startAt": "Start date must be in the future"
  }
}
```

## Acceptance Criteria
- Partner can submit a valid event request without admin access.
- Moderator can approve/reject/request changes from one detail screen.
- Partner sees latest decision and actionable feedback in status view.
- Required validations and accessibility rules are implemented as specified.

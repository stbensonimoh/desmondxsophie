# RSVP & Invite System — Design Doc

Last updated: 2025-10-30

## Goals
- Simple, reliable RSVP and personalized invite flow with minimal infrastructure.
- Prevent misuse: a code must only work for the assigned guest and be single-use.
- Capture attendance intent (YES/NO/MAYBE), plus attendees count (n) within allowed limit.
- Collect and validate Nigerian phone numbers to send SMS confirmations.
- Provide an admin dashboard to create/match codes and manage guests.
- Keep the stack lean (Next.js + Prisma + MySQL) with optional MySQL-only outbox for async SMS.

## Non-Goals
- No full event-sourced architecture, no Kafka/Redis by default.
- No complex auth system; a simple env-gated admin is sufficient initially.

## Requirements
- Invite URL: `/invite/[name]?code=XXXX&n=1`
  - `name` is a slug derived from guest full name.
  - `code` is a unique 4-character alphanumeric code assigned to the guest.
  - `n` is the requested number of attendees; must not exceed the code’s `maxAttendees`.
- RSVP page reachable via CTA; accepts only `YES`, `NO`, `MAYBE`.
- Phone is required, email optional. Phone must be a valid Nigerian number and stored in E.164 (`+234...`).
- Code cannot be reused and cannot be used with another guest’s name.
- Admin dashboard for:
  - Creating/updating guests (name, optional email).
  - Generating codes (4-char) with `maxAttendees` and assigning to a guest.
  - Viewing code status and copying invite links.
- SMS sent on RSVP with different templates for YES/NO/MAYBE.

## High-level Architecture
- Next.js (App Router) renders invite and RSVP pages. Server Actions handle form submissions.
- Prisma connects to MySQL. Data integrity enforced via unique keys and relations.
- HMAC-signed token authorizes RSVP for a specific guest+code pair.
- Optional asynchronous side effects via MySQL transactional outbox processed by a small worker or a scheduled route.

```
Invite Page (SSR) ── validate name+code ──> issue HMAC token ── CTA ──> RSVP Page
                                                        |                             
                                            MySQL (Prisma)                            
                                                        |                             
                                            Outbox enqueue (optional) ──> SMS worker  
```

## Data Model (Prisma)

```prisma
enum RSVPStatus {
  YES
  NO
  MAYBE
}

model Guest {
  id        String       @id @default(cuid())
  fullName  String
  nameSlug  String       @unique
  email     String?      @unique
  phone     String?      // set/validated at RSVP; stored E.164 +234...
  note      String?
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  codes     InviteCode[]
  responses RsvpResponse[]

  @@index([nameSlug])
}

model InviteCode {
  id            String       @id @default(cuid())
  code          String       @unique
  maxAttendees  Int          @default(1)
  assignedToId  String?
  assignedTo    Guest?       @relation(fields: [assignedToId], references: [id])
  usedAt        DateTime?
  response      RsvpResponse?

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model RsvpResponse {
  id          String      @id @default(cuid())
  guestId     String
  codeId      String      @unique
  status      RSVPStatus
  attendees   Int         @default(1)
  note        String?
  respondedAt DateTime    @default(now())

  guest       Guest       @relation(fields: [guestId], references: [id])
  code        InviteCode  @relation(fields: [codeId], references: [id])

  @@index([guestId, status])
}

model OutboxEvent {
  id           String   @id @default(cuid())
  type         String
  payload      Json
  createdAt    DateTime @default(now())
  processedAt  DateTime?
  tries        Int      @default(0)

  @@index([processedAt, type])
}
```

Notes:
- `InviteCode.code` is globally unique, 4 chars. `usedAt` is set after RSVP save to enforce single-use.
- `RsvpResponse.codeId` unique ensures one response per code.
- `Guest.nameSlug` unique binds a canonical URL-friendly name to a person.
- Optional: add FK constraints and DB-level cascades as needed.

## URL Scheme and Navigation
- Invite page: `/invite/[name]?code=XXXX&n=1`
  - Validates: code format, code exists, code assigned to `nameSlug`, code not used.
  - Displays personalized note and allowed guests: `min(max(1, n), maxAttendees)`.
  - CTA builds `/rsvp?token=...` with a signed token.
- RSVP page: `/rsvp?token=...`
  - Loads guest+code via token. If code used, shows "already submitted" message.
  - Form fields:
    - status: YES/NO/MAYBE (required)
    - attendees: 1..maxAttendees (required, bounded)
    - phone: Nigerian, required
    - note: optional

## Authorization Token
- Structure: HMAC over base64url(JSON({ gid, code, exp })) using `INVITE_TOKEN_SECRET`.
- Lifetime: 24 hours (configurable). Regenerated each time invite page is loaded.
- Verification: compare HMAC with `timingSafeEqual`, ensure `exp` not expired, then lookup guest by `gid` and code by `code`, ensure code is assigned to the guest.

## Validation
- Code format: `/^[A-Z0-9]{4}$/`.
- Attendees: clamp to [1, `InviteCode.maxAttendees`].
- Phone: Nigeria only.
  - Accepts: `0803xxxxxxx` or `+234803xxxxxxx`.
  - Normalize and store: `+234803xxxxxxx`.
  - Example algorithm:
    - If `+234[1-9]\d{9}` => ok.
    - Else if `0[1-9]\d{9}` => replace leading `0` with `+234`.
    - Else invalid.
- Status: enum of YES/NO/MAYBE only.

## Security & Abuse Prevention
- Token binds to guest+code; server re-validates assignment and single-use.
- DB constraints enforce uniqueness and one-response-per-code.
- Invite page rejects mismatched name/code and already-used codes.
- Admin dashboard protected by Basic Password (env var) or cookie gate; routes are server-only.
- All secrets in env vars; no secrets client-side.

## Admin Dashboard
- Features:
  - Create/update guest (fullName, optional email).
  - Generate 4-char codes with `maxAttendees` and optionally assign to a guest.
  - List codes (code, maxAttendees, assigned guest, used/active) with quick invite links.
- Security: env password gate; uses HTTP-only cookie after login.
- Operations: Codes can remain unassigned for later mapping; invite links are shown for assigned codes.

## Asynchronous Side Effects (Keep It Simple)
- Use a transactional outbox in MySQL to queue events such as `RSVP_SUBMITTED`.
- Processing options (choose one):
  1) A tiny Node worker `npm run worker` polling every 5s.
  2) A scheduled serverless route (e.g., Vercel Cron) to process pending events.
- Delivery semantics: at-least-once. Consumers must be idempotent (e.g., upsert by externalId, track last processed id).
- Retry policy: exponential backoff with a max tries; move to dead-letter (mark payload) after limit.

### Event Types
- `RSVP_SUBMITTED` — payload: `{ guestId, fullName, phone, status, attendees, code }`
- `CODE_GENERATED` — payload: `{ code, guestId?, maxAttendees }`
- `INVITE_VIEWED` (optional) — payload: `{ guestId, code }`

### SMS Delivery
- SMS adapter abstracts provider (Termii/Twilio/Africa’s Talking). Env-driven config.
- Templates:
  - YES: `Thanks {firstName}! Your RSVP for {attendees} is confirmed.`
  - NO: `Thanks {firstName}. Sorry you can’t make it—wishing you well!`
  - MAYBE: `Thanks {firstName}. Let us know when you decide.`

## Sequence Flows

### Invite Flow
1. Guest opens `/invite/[name]?code=XXXX&n=k`.
2. Server validates code, assignment to nameSlug, not used; clamps `k` to `maxAttendees`.
3. Server renders note and CTA with `token = sign({ gid, code, exp })`.

### RSVP Submission
1. Client POSTs form (Server Action) with token, status, attendees, phone, note.
2. Server verifies token, re-checks code assignment and `usedAt` is null.
3. Server validates inputs; normalizes phone to E.164.
4. In a DB transaction:
   - Update guest phone/note.
   - Create `RsvpResponse` (unique per `codeId`).
   - Set `InviteCode.usedAt = now()`.
   - Optionally enqueue `OutboxEvent` (RSVP_SUBMITTED).
5. Respond with redirect to "Thanks" page.

### Admin Code Generation
1. Admin logs in via password page.
2. Admin creates/updates guest and generates codes with `maxAttendees`.
3. System ensures unique 4-char code and optional assignment to guest.
4. Page shows copyable link to `/invite/[slug]?code=CODE&n=max`.

## Operational Considerations
- Local dev: Dockerized MySQL 8. Env: `DATABASE_URL`, `INVITE_TOKEN_SECRET`, `INVITE_ADMIN_PASSWORD`, `SMS_API_URL`, `SMS_API_KEY`.
- Deploy: Vercel for Next.js, managed MySQL (PlanetScale/RDS) for simplicity.
- Backups: rely on provider snapshots; keep seed scripts for local testing.
- Logging: keep Prisma `warn`/`error`; log RSVP submissions and SMS failures.
- Observability: a minimal `/admin` table view is enough initially; add CSV export if needed.

## Testing Strategy
- Unit:
  - `slugifyName`, `normalizeNgPhone`, token sign/verify.
- Integration:
  - Invite page validates mismatched name/code and used codes.
  - RSVP transaction enforces single-use and attendee bounds.
  - Outbox consumer processes `RSVP_SUBMITTED` and is idempotent.
- E2E (optional):
  - From invite link to successful RSVP and SMS enqueue.

## Edge Cases
- Wrong name with correct code: Invite rejects; no token issued.
- Code already used: Invite shows "already used"; RSVP page blocks.
- Phone invalid: RSVP re-renders with a validation error; no DB changes.
- Token expired: RSVP page shows invalid/expired; user must revisit invite link.
- Duplicate submit: code-level uniqueness and `usedAt` prevent double writes.

## Future Enhancements
- Capacity per guest group or family; dynamic `maxAttendees`.
- Add email notifications.
- Export RSVPs as CSV.
- Real auth (Clerk/Auth.js) for admin and audit trail.
- Replace polling with managed queue if volume grows.

## Minimal .env
```
DATABASE_URL=mysql://root:secret@localhost:3306/desmondxsophie
INVITE_TOKEN_SECRET=replace-with-long-random-string
INVITE_ADMIN_PASSWORD=choose-a-strong-password
SMS_API_URL=provider-endpoint
SMS_API_KEY=provider-key
```

## Implementation Notes
- Keep all validations server-side; never trust client params like `n` beyond clamping.
- Prefer server components and server actions for simplicity and security.
- Encapsulate provider-specific SMS logic behind a small adapter for easy swapping.
- Use composite indices to keep lookups fast and predictable.

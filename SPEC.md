# SPEC — agenda-barber · Google Calendar integration

## §G — goal

Barber connects his Google Calendar via button in admin agenda. ∀ new appointment → insert event w/ popup-notification reminder into barber calendar. Write-only (⊥ pull). Wired now, live when Google env keys filled.

## §C — constraints

- Stack: Next.js `16.1.6` App Router, React `19.2.3`, TS, server actions (`"use server"`). No new SDK dep — hand-roll OAuth + Calendar REST via `fetch`, mirror `src/lib/airtable.ts` & `src/lib/uazapi.ts` style.
- Datastore Airtable. Multi-tenant by `host` header → `getCurrentTenantBaseId()`, `getCurrentBrand()` in `src/lib/tenant.ts`. Per-barber config in `Tenants` table.
- Env unset | tenant not connected → sim/no-op, log only (mirror `uazapi.ts` line 36-41). ! createAppointment still succeeds.
- Google side effect ! never throw into booking flow — same as `void NotificationService.*` in `src/app/actions/appointments.ts:98-99`.
- Secrets (client secret, refresh token) server-only. ⊥ reach browser.
- Reminder methods Google API supports = `email` | `popup` only. No true "alarm/sound" method ∴ reminder = single popup `GoogleReminderMinutes` before start (decided). Refresh token stored on Airtable `Tenants` record (decided).

## §I — interfaces

- env: `GOOGLE_CLIENT_ID` ! set (live)
- env: `GOOGLE_CLIENT_SECRET` ! set (live)
- env: `GOOGLE_OAUTH_REDIRECT_URI` ? — else derive from request host + `/api/google/callback`
- env: `GOOGLE_CALENDAR_ID` ? default `primary`
- route: `GET /api/google/connect` → 302 Google consent (scope `calendar.events`, `access_type=offline`, `prompt=consent`)
- route: `GET /api/google/callback?code=…` → exchange code → store refresh token on tenant → 302 `/admin`
- action: `getGoogleCalendarStatus()` → `{connected:boolean, configured:boolean, reminderMinutes:number, accountEmail:string|null}`
- action: `disconnectGoogleCalendar()` → clear tenant token → boolean
- lib: `src/lib/google-calendar.ts` → `insertAppointmentEvent(booking, opts)`, `exchangeCode(code)`, `refreshAccessToken(refreshToken)`
- Tenants fields (new): `GoogleRefreshToken`, `GoogleReminderMinutes` (default 30), `GoogleAccountEmail` (display only)
- ui: connect/disconnect button above `<AgendaView>` in agenda tab (`src/components/admin/admin-page-client.tsx:183-188`)
- google api: `POST https://oauth2.googleapis.com/token`
- google api: `POST https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events`

## §V — invariants

```
V1: ∀ createAppointment record-create success → attempt Google event insert (barber calendar)
V2: Google integration write-only → only events.insert; ⊥ list|get|watch|pull events ∈ app
V3: Google env unset | tenant not connected → no-op sim, log only; createAppointment still returns appointment
V4: refresh token & client secret server-only → ⊥ serialized to client component | response body
V5: inserted event ! reminders.useDefault=false & ≥1 popup override (notification) → alert barber
V6: OAuth scope = `https://www.googleapis.com/auth/calendar.events` + `openid email` (identity display only) → ⊥ calendar-read scope
V7: event insert targets connected tenant's calendar only → per-tenant refresh-token isolation
V8: Google insert|token failure → log + swallow, ⊥ throw into booking flow
V9: reminder = single popup override @ `GoogleReminderMinutes` before start (default 30)
V10: connected state ! visibly confirmed ∈ admin UI → badge + connected account email (from id_token, stored `GoogleAccountEmail`)
V11: connect button ! follow Google Identity branding (official "G" logo, approved colors/shape) — https://developers.google.com/identity/branding-guidelines
```

## §T — tasks

```
id|status|task|cites
T1|x|add GOOGLE_* keys to `.env.example` (client id/secret/redirect/calendar id)|I.env
T2|x|lib `src/lib/google-calendar.ts`: token exchange+refresh & events.insert via fetch, sim mode when env unset|V2,V3,V5,V6,V8
T3|x|Tenants fields + tenant.ts helpers: read/write GoogleRefreshToken, GoogleReminderMinutes; getGoogleRefreshToken()|V4,V7,I.env
T4|x|route `GET /api/google/connect` → build consent url, 302|V6,I.api
T5|x|route `GET /api/google/callback` → exchangeCode, store refresh token on tenant, 302 /admin|V4,V7,I.api
T6|x|hook insertAppointmentEvent into createAppointment after record-create (fire-and-forget, swallow)|V1,V3,V8
T7|x|actions getGoogleCalendarStatus / disconnectGoogleCalendar|V4,I.api
T8|x|UI connect/disconnect button above AgendaView in agenda tab; status-driven label|I.ui
T9|x|reminder lead-minutes option (GoogleReminderMinutes) in event build & settings UI|V5,V9
T10|x|README: Google Cloud OAuth setup steps (consent screen, redirect uri, scopes)|I.env
T11|x|scope + `openid email`; callback decodes id_token → store `GoogleAccountEmail` on tenant|V6,V10,I.api
T12|x|UI connected signal: badge "Conectada" + account email ∈ connect card; expose accountEmail via status action|V10,I.ui
T13|x|Google-branded connect button (official G logo svg, branding-guideline colors/shape)|V11,I.ui
```

## §B — bugs

```
id|date|cause|fix
```

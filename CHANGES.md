# Architecture Changes — B2B + B2C Unified Pages

## What Changed

### Problem
Flight, Hotels, Insurance, Series Fare pages existed 3 times each:
- `/app/flights/` (common)
- `/app/b2c/flights/` (duplicate)
- `/app/b2b/flights/` (duplicate with different code)

### Solution
**One page, role-based behavior at booking time** via `useAuthStore().role`

---

## Files Modified

### `middleware.ts`
- Added redirects: `/b2c/flights` → `/flights`, `/b2c/hotels` → `/hotels`, etc.
- `/b2c/search` → `/flights`
- All query params are forwarded correctly

### `app/flights/page.tsx` (Common page — KEPT, enhanced)
- Added `AgentBookingDialog` component — wallet deduction inline (no redirect)
- `handleBook()` now:
  - `role === 'agent'` → opens `AgentBookingDialog` (calls `agentApi.bookFlight`)
  - `isAuthenticated` → opens `BookingDialog` (B2C, calls `customerApi.initiateBooking`)
  - Guest → opens `BookingRoleModal`
- Fixed `b2bRedirectUrl` to point to `/flights` (not `/b2b/flights`)

### `app/hotels/page.tsx` (Common page — KEPT, fixed)
- `handleBook()` — agent no longer redirects to `/b2b/hotels` (would loop)
- Agent now opens same `bookHotel` dialog (hotel booking handled server-side by role)
- Fixed `b2bRedirectUrl` in role modal

### `app/insurance/page.tsx` (Common page — KEPT, fixed)
- Agent no longer redirects to `/b2b/insurance` (would loop)
- Agent buy flow redirects to `/b2b/bookings` after success

### `app/b2b/flights/page.tsx` (REPLACED — now a redirect)
- Old: ~300 lines of duplicate flight search code
- New: Simple redirect to `/flights` with query params forwarded

### `app/b2b/hotels/page.tsx` (REPLACED — now a redirect)
- Old: ~150 lines of duplicate hotel search code
- New: Simple redirect to `/hotels` with query params forwarded

### `app/b2b/insurance/page.tsx` (REPLACED — now a redirect)
- Old: ~150 lines of duplicate insurance code
- New: Simple redirect to `/insurance` with planId forwarded

### `app/b2c/search/page.tsx` (FIXED)
- Now redirects to `/flights` instead of `/b2c/flights` (avoids double redirect)

---

## How Booking Works Now

| User State | Clicks Book | Result |
|---|---|---|
| Not logged in | Any page | `BookingRoleModal` → choose B2C login or B2B login |
| Logged in (customer) | Any page | `BookingDialog` — card/UPI payment |
| Logged in (agent) | Any page | `AgentBookingDialog` — wallet deduction |
| Agent via B2B sidebar | B2B Flights link | Redirected to `/flights`, agent dialog opens at booking |

## Auth Flow After Login
- B2C login → redirects to `/flights` (or whatever common page user was on)
- B2B login → redirects to `/flights` (or whatever common page user was on)
- After login, `useAuthStore().role` is set → correct dialog opens automatically


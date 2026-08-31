# Landing Page

## Goal

Root route `/` promotes this boarding house to prospective and returning guests. Page highlights modern room access, transparent stay management, practical guest support, and easy booking. Guest flow explains how to start and use these benefits.

This is a boarding-house landing page, not only a room catalogue or technology showcase. It may use warm, confident promotional copy, and may include illustrative guest testimonials.

## Audience

- New guests arriving through website without room QR code
- Guests returning to room dashboard
- Staff through low-priority login selection

## Route and actions

- Root route: `/`
- Browse rooms: `/bookings`
- Login selection: `/login`
- Direct room booking from QR: `/bookings/:id`

No generic booking form. QR code identifies room and opens direct booking page.

## Page sections

### 1. Navbar

- Innavance logo, linked to `/`
- `Login` button, linked to `/login`
- Minimal layout; no multi-item navigation
- Match user-facing app styling: Inter, neutral background, white or transparent navbar treatment, green primary action, rounded corners
- Responsive: logo and login button remain visible on small screens

### 2. Welcome hero

- Full-screen hero with background image/video overlay and dark gradient to keep text legible
- **Eyebrow:** `Boarding house made easier`
- **Heading:** `Welcome to Innavance`
- **Supporting line:** `Your stay, in your hands.`
- **Body copy:** `Book your room, manage your stay, and get help from staff in one place.`
- **Primary action:** `Browse rooms` → `/bookings`
- **Secondary action:** `Login` → `/login`
- **Supporting guidance:** `Scan your room's QR code to open that room directly.`
- Visual: background image/video with overlay; QR scan icon as decorative element. No fake QR code.

### 3. Booking flow

- Light background, clean numbered steps with icons
- **Section heading:** `Getting started is simple`
- Three ordered steps:
  1. **`Scan your room QR code`** — `Opens reservation for that specific room.`
  2. **`Confirm your stay`** — `Enter stay details and select any available add-ons.`
  3. **`Get approved`** — `Pay staff first when required, or enter right away when automatic approval is enabled.`
- Supporting note: `Approval timing depends on boarding-house settings.`
- Do not promise instant approval.

### 4. Room features

- Dark or tinted background with large feature cards, real system capabilities only
- **Section heading:** `Everything for your stay`
- Four feature cards with real backend features:
  - **`Smart room access`** — `Access your room with door PIN after reservation approval.`
  - **`Track your utilities`** — `Check electricity and water usage from your guest dashboard.`
  - **`Request add-ons`** — `Order available extras. Staff delivers them after booking approval.`
  - **`Call staff when needed`** — `Request staff help through your dashboard.`
- Do not claim remote unlock, live utility pricing, chat, staff response time, or features not in app.

### 5. Guest testimonials

- Light background, three review cards with fictional but believable quotes
- **Section heading:** `What our guests say`
- Three cards:
  - `Innavance made my stay effortless. Booking, utilities, checkout — all in one place.` — `Sarah, 3-month guest`
  - `The smart door PIN and dashboard notifications gave me real peace of mind.` — `Budi, business traveler`
  - `Staff came right to my room when I needed help. Quick and friendly.` — `Dewi, weekend guest`

### 6. Checkout

- Clean section with icon and short copy
- **Section heading:** `Checkout on your schedule`
- **Body copy:** `Check out from your guest dashboard when you are ready. Your room gets a grace period before door PIN resets.`
- **Supporting line:** `Staff can help with checkout and room access when needed.`
- Do not expose force-checkout behavior, internal controls, or exact grace-period rules.

### 7. Help

- Simple centered section with contact prompt
- **Section heading:** `Need help?`
- **Body copy:** `Contact boarding-house staff for booking, payment, room, or checkout assistance.`
- No fake phone number, email, WhatsApp link, address, opening hours, or staff availability claim. This stays informational until property contact details exist.

### 8. Footer

- Innavance logo/name
- `Login` link → `/login`
- Optional low-priority `Browse rooms` link → `/bookings`
- Existing user-facing footer notices retained when real links exist: `Admin contact`, `Room rules`, `Another notice`
- Property identity/contact/rules only after owner provides content

## Visual system

- Clean, minimal, white-first aesthetic inspired by Vercel and NestJS landing pages
- Light canvas with subtle background fills, decorative shapes, or soft gradients to avoid text-heavy walls
- Use installed `lucide-react` icons and real images where possible
- Existing app palette: `neutral-100` canvas, white cards, `neutral-600` footer, green primary CTA
- Existing app type: Inter
- Existing app shapes: `rounded-lg` panels and cards; `rounded-md` controls
- Existing app depth: restrained white-card shadow
- Tone: warm, calm, practical; not luxury marketing
- Layout: spacious single column on mobile; feature grid on larger screens
- Use existing `/logo.svg`
- No new dependencies

## Accessibility and behavior

- Semantic `header`, `main`, `section`, `nav`, and `footer`
- One `h1`; ordered headings afterward
- Buttons and links have visible keyboard focus
- Icons include labels or accessible text
- Maintain sufficient contrast
- Responsive from small phones upward
- Any animation respects reduced-motion preference

## Explicit non-goals

- No public room availability calendar, prices, or catalogue inside landing page
- No generic booking flow
- No invented property facts, prices, awards, or unsupported amenity claims
- No public admin controls
- No new backend endpoint

## Content needed later

- Boarding-house name if different from Innavance
- Staff contact method and hours
- Guest-facing payment details
- Property rules and notices
- Confirmed add-ons and amenity wording

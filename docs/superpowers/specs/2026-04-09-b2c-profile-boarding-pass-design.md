# Design Spec: B2C Client Profile & Boarding Pass UI

## Context
Implement a premium "Rich Dark" profile page for B2C clients in MujerApp. This page replaces the standard profile view with a specialized "boarding pass" aesthetic for appointments, including a sticky sidebar for navigation.

- **Route**: `src/app/(marketplace)/perfil/page.tsx`
- **Aesthetic**: Zinc-950 background, emerald-400 accents, #1A1A1A boarding passes with dot patterns.

## Requirements

### 1. General Layout
- **Container**: `flex min-h-screen bg-zinc-950`
- **Sidebar**: `w-72 bg-zinc-900 border-r border-white/8 sticky top-0 h-screen`
- **Main Content**: `flex-1 px-12 py-12`

### 2. Sidebar Component
- **User Identity**: 
  - Avatar: 96x96px circle, `bg-zinc-800`, initials-based if no image.
  - Presence: `emerald-400` dot at bottom-right of avatar.
  - Text: "BIENVENIDA" (emerald upper), Name (white), Email (zinc-500).
- **Navigation Links**:
  - Items: Panel de Turnos (Active), Historial de Citas, Mi Perfil, Favoritos.
  - Active State: `bg-emerald-400/10 text-emerald-400`.
  - Hover: `hover:bg-white/5 hover:text-white`.
  - Icons: `Calendar`, `Clock`, `User`, `Heart`.
- **Footer**: Logout link with `LogOut` icon, red hover effect.

### 3. Boarding Pass (Appointment Card)
- **Visuals**:
  - Background: `#1A1A1A` with a subtle `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 0)` (16px grid).
  - Shape: 24px rounded corners.
  - Notches: Semi-circles at the vertical midpoint of the sides, matching `bg-zinc-950`.
  - Divider: `border-left 2px dashed rgba(255,255,255,0.10)`.
- **Content - Left Side (Info)**:
  - Header: Salon type/name, service icon, date.
  - Grid: Staff Name, Service Name, Time, Location.
- **Content - Right Side (Check-in)**:
  - Label: "CÓDIGO DE CHECK-IN".
  - QR Code: Mock SVG with white background.
  - Code: Monospace `#MB-YYYY-ID`.

### 4. Logic & Navigation
- **Mock Data**: Use provided arrays for `MOCK_APPOINTMENTS` and `MOCK_USER`.
- **Login Redirect**: Update `src/app/login/page.tsx` to redirect to `/perfil` post-login.
- **Transitions**: Scale effects on cards, color transitions on nav.

## Architecture
- `ProfilePage`: Main container.
- `Sidebar`: Nav component.
- `AppointmentTicket`: The boarding pass component.

## Unresolved Items / Assumptions
- **Font**: Using `font-vogue` (Playfair Display) for titles as per existing project patterns.
- **Mobile**: Sidebar will remain visible or handle basic stacking (no complex drawer required yet as per prompt).

## Success Criteria
- [ ] `/perfil` renders with dark sidebar and emerald accents.
- [ ] Boarding passes feature notches and QR codes.
- [ ] Hover on cards triggers scale animation.
- [ ] Login page redirects to profile.

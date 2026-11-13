# Smart Poultry dashboard redesign

Date: 2026-11-10
Status: Implemented in the user-facing prototype; updated with the time-cycle and Nocturne theme direction from the latest Stitch export.

## Goal

Make the user-facing Smart Poultry dashboard feel fuller and more distinctive by adapting the supplied farming-app reference: a recognizable farm landscape, clear monitoring summaries, and persistent bottom navigation on mobile. Keep the existing chicken-monitoring scope and data.

## Design direction

Design Read: mobile-first poultry monitoring for coop users, with a real coop photograph and calm operational hierarchy, dials ENERGY 2 / RHYTHM 2 / MOTION 1.

The reference contributes its outdoor scene, warm environmental masthead, time-cycle treatment, 2×2 feature tiles, and bottom navigation. Smart Poultry keeps its forest-green and warm-neutral identity, adds the supplied Nocturne palette for night/dark mode, and uses a locally bundled CC0 poultry photograph in the hero. The environment card may use the reference's subtle cream-to-meadow gradient because it groups climate readings; do not copy the reference app's branding, people, labels, or out-of-scope farm features.

Use the locally bundled CC0 poultry photograph as the home hero. Do not add human characters or fabricate sensor imagery. Keep all text on solid surfaces for contrast.

## Stitch assets

Use the user-provided Stitch ZIPs as local design references, not as replacement application code. Keep the locally bundled Stitch context photos on Controls and Camera, and use the locally bundled CC0 poultry photo in the Home hero. Label every static camera image with the disconnected-camera status so it cannot be mistaken for live footage. Do not import the Stitch logo or history/YOLO treatments, and do not adopt the extra telemetry or controls in generated code.

## Mobile home layout

1. Compact Smart Poultry header with notification and profile shortcuts.
2. Compact photo hero for the main coop, with a short greeting, the existing flock count of 12, and the existing connection state.
3. One warm environmental masthead that groups the current temperature 28.4 °C, humidity 67%, feed availability, and valve state; do not add a new sensor or derived status.
4. A 2×2 quick-access grid linking to the existing Monitoring, Controls, Camera, and Notifications routes. The Camera tile uses the local Stitch photo and keeps the disconnected label.
5. Keep lamp/music state and unread-notification count reachable through the existing Controls and Notifications routes; do not repeat large summary panels below quick access on mobile.
6. Persistent bottom navigation for Home, Monitoring, Controls, Camera, Notifications, and Profile.

The photo hero is the main visual anchor. The environmental masthead groups readings instead of repeating four equal cards. Quick-access tiles use two columns on mobile and expand on wide screens. The compact mobile first view should show the hero, environment, and quick access without redundant lower panels.

## Time and theme

- Display the local device clock in 24-hour format and refresh it while the app is open.
- Default theme follows local time automatically: Siang 06:00–16:59, Sore 17:00–19:59, Malam 20:00–05:59. Sore uses warm surfaces; Malam uses the supplied Nocturne palette.
- A Dark Mode control can manually force Dark or Light. An Auto control returns to the time-based cycle. Persist the preference in local browser storage.
- The clock and period label are display-only; they never alter fixture telemetry or claim live device data.

## Wide-screen layout

Retain the existing user sidebar and top bar. Expand the illustrated hero across the main content area, place monitoring summaries beneath it, and arrange device/camera/notification sections in a balanced two-column area. Do not add an admin sidebar or new routes.

## Interaction and data

- Keep existing routes, controls, notification actions, and profile behavior.
- Keep sensor values as the current demo fixtures; do not invent additional readings.
- Do not add weight, water-flow/debit, YOLO, or history content.
- Keep the lamp as one fixed red + warm-white mode.
- Keep all device controls local-only and retain truthful disconnected-camera/IoT statuses.
- Use the existing calm active-state treatment and visible keyboard focus. No glow or looping animation.

## Acceptance criteria

- The mobile home screen has a visible farm illustration and a clear monitoring hierarchy without feeling like an empty card grid.
- At 390 px, 715 px, and desktop widths, the layout has no horizontal overflow and controls remain usable.
- All six user routes remain reachable; bottom navigation remains available on mobile.
- Existing DEMO and connection-state disclosures remain accurate.
- The clock matches the browser's local time, period/theme changes at the documented boundaries, and the Dark Mode/Auto controls persist and restore correctly.
- No new telemetry values, admin content, or unsupported IoT behavior is introduced.

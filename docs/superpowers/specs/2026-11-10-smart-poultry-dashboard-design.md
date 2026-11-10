# Smart Poultry dashboard redesign

Date: 2026-11-10
Status: Design proposal approved in chat; awaiting written-spec review before implementation.

## Goal

Make the user-facing Smart Poultry dashboard feel fuller and more distinctive by adapting the supplied farming-app reference: a recognizable farm landscape, clear monitoring summaries, and persistent bottom navigation on mobile. Keep the existing chicken-monitoring scope and data.

## Design direction

Design Read: mobile-first poultry monitoring for coop users, with an illustrated farm landscape and calm operational hierarchy, dials ENERGY 2 / RHYTHM 2 / MOTION 1.

The reference contributes its illustrated outdoor scene, layered information panel, and bottom navigation. Smart Poultry keeps its own forest-green and warm-neutral identity, with sky blue and field green used only in the coop illustration. Do not copy the reference app's branding, people, labels, or farm features.

Use a simple, original vector-style scene of a chicken coop, field, and a few chicken silhouettes. Do not add human characters, generated photos, or external image assets. Keep all text on solid surfaces for contrast.

## Mobile home layout

1. Compact Smart Poultry header with notification and profile shortcuts.
2. Illustrated hero for the main coop, with a short greeting, the existing flock count of 12, and the existing connection state.
3. Four concise monitoring summaries: temperature 28.4 °C, humidity 67%, feed available, and water valve state. Preserve the existing DEMO disclosure for fixture data.
4. A device-status section for the fixed red + warm-white lamp and music state, with a clear link to Controls.
5. A small camera status preview and the existing recent-notification preview. Keep them secondary to the coop summary.
6. Persistent bottom navigation for Home, Monitoring, Controls, Camera, Notifications, and Profile.

The hero illustration is the main visual anchor. Monitoring summaries use a compact two-column layout; supporting device and camera sections use quieter, varied layouts rather than identical repeated cards.

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
- No new telemetry values, admin content, or unsupported IoT behavior is introduced.

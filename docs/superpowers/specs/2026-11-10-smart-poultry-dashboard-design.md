# Smart Poultry dashboard redesign

Date: 2026-11-10
Status: Design proposal approved in chat; awaiting written-spec review before implementation.

## Goal

Make the user-facing Smart Poultry dashboard feel fuller and more distinctive by adapting the supplied farming-app reference: a recognizable farm landscape, clear monitoring summaries, and persistent bottom navigation on mobile. Keep the existing chicken-monitoring scope and data.

## Design direction

Design Read: mobile-first poultry monitoring for coop users, with an illustrated farm landscape and calm operational hierarchy, dials ENERGY 2 / RHYTHM 2 / MOTION 1.

The reference contributes its illustrated outdoor scene, warm environmental masthead, 2×2 feature tiles, and bottom navigation. Smart Poultry keeps its own forest-green and warm-neutral identity, with sky blue and field green used only in the coop illustration. The environment card may use the reference's subtle cream-to-meadow gradient because it groups climate readings; do not copy the reference app's branding, people, labels, or farm features.

Use a simple, original vector-style scene of a chicken coop, field, and a few chicken silhouettes. Do not add human characters or images beyond the user-provided Stitch assets listed below. Keep all text on solid surfaces for contrast.

## Stitch assets

Use the user-provided Stitch ZIPs as local image sources, not as replacement application code. Copy three relevant poultry photos into `src/assets/stitch/`: the overhead coop image for the Home camera preview, the perch/feed-area image as a visual context strip on Controls, and the wide flock image on the Camera page. Keep the SVG landscape hero as the main Home illustration. Label every static camera image with the existing disconnected-camera status so it cannot be mistaken for live footage. Do not import the Stitch logo or the history/YOLO screen asset, and do not adopt the extra telemetry or controls in the generated code.

## Mobile home layout

1. Compact Smart Poultry header with notification and profile shortcuts.
2. Illustrated hero for the main coop, with a short greeting, the existing flock count of 12, and the existing connection state.
3. One warm environmental masthead that groups the current temperature 28.4 °C, humidity 67%, feed availability, and valve state; do not add a new sensor or derived status.
4. A 2×2 quick-access grid linking to the existing Monitoring, Controls, Camera, and Notifications routes. The Camera tile uses the local Stitch photo and keeps the disconnected label.
5. A device-status summary for lamp/music and the existing recent-notification preview.
6. Persistent bottom navigation for Home, Monitoring, Controls, Camera, Notifications, and Profile.

The hero illustration is the main visual anchor. The environmental masthead groups readings instead of repeating four equal cards. Quick-access tiles use two columns on mobile and expand on wide screens; device and notification sections remain secondary.

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

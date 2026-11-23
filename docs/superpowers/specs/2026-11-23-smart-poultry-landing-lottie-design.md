# Smart Poultry Landing Lottie Design

Date: 2026-11-23
Status: Design direction and written spec approved by user.

## Goal and scope

Add one original Lottie animation to the existing Smart Poultry landing-page hero. Keep the interactive dashboard preview, copy, login, signup, user Pro, Lite, and admin behavior unchanged. The animation is an illustration, not telemetry or a claim that a real coop is connected.

## Approved visual direction

Reading this as: an agricultural product landing page for poultry farmers, using Smart Poultry's forest-green, cream, and gold identity; ENERGY 2 / RHYTHM 2 / MOTION 2.

The focal illustration is a hen calmly pecking feed beside a simple coop silhouette. One small sensor-shaped pulse may echo the monitoring theme, but it must read as illustration and not as a live sensor indicator. Use the existing palette: Forest Green `#006B35`, Deep Green `#00843D`, Fresh Green `#55B82A`, Golden Yellow `#FFB515`, and Cream `#FFF4D8`. Keep Plus Jakarta Sans for any accompanying label.

Place the animation in the existing hero visual composition without obscuring or replacing the interactive dashboard preview. Keep it visually secondary to the headline and dashboard preview. Motion should be a slow, short idle loop that adds poultry-specific character without pulling attention from the controls.

## Asset and runtime

Create the animation locally as a Lottie JSON asset under `src/assets/lottie/`. The user does not need to upload files. Render it in the landing page using a pinned Lottie-compatible web runtime. Keep a local static fallback so the hero remains complete if animation playback is unavailable.

## Accessibility and states

- Treat the animation as decorative and hide it from assistive technology; the page's existing text remains the source of meaning.
- Respect `prefers-reduced-motion`: do not autoplay or loop for users who request reduced motion; show the static fallback instead.
- Pause playback while the hero is outside the viewport or the page is hidden.
- Do not label the visual `LIVE`, report sensor values, or imply hardware connectivity.
- Keep the layout usable at mobile and desktop widths and in all landing-page themes.

## Verification

Validate the JSON structure and runtime load, verify the fallback and reduced-motion path, check for console/resource errors, and test the landing hero at mobile and desktop widths. Run the full project test suite and preserve the user/admin boundaries.

## Self-review

Scope is limited to the landing hero. The animation is locally authored, poultry-specific, and subordinate to the existing dashboard preview. Its only loop is a slow character idle, not a live-status claim. Reduced-motion users receive a still fallback. No unsupported metrics, external customer assets, or new navigation are introduced.

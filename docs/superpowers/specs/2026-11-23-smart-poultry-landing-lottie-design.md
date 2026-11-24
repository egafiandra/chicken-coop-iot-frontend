# Smart Poultry Landing Lottie Design

Date: 2026-11-23
Status: The initial vector direction was approved; the illustration was replaced by a licensed real photograph after user feedback.

## Goal and scope

Add a locally bundled, real photograph of a hen feeding to the existing Smart Poultry landing-page hero. Use Lottie for a restrained camera push/pan across the photograph, with an explicit play control when reduced motion is enabled. Keep the interactive dashboard preview, copy, login, signup, user Pro, Lite, and admin behavior unchanged. The visual is illustrative, not telemetry or a claim that a real coop is connected.

## Revised visual direction

Reading this as: an agricultural product landing page for poultry farmers, using Smart Poultry's forest-green, cream, and gold identity; ENERGY 2 / RHYTHM 2 / MOTION 2.

The visual is a candid, licensed photograph of a hen eating from a feeder in an outdoor enclosure. Do not draw or generate a cartoon substitute, and do not add a sensor/status mark. Keep the photograph natural; use the existing palette in the surrounding UI: Forest Green `#006B35`, Deep Green `#00843D`, Fresh Green `#55B82A`, Golden Yellow `#FFB515`, and Cream `#FFF4D8`. The Lottie motion shifts and gently zooms the camera framing; it does not animate the hen's anatomy or imply live data.

Place the photograph in the existing hero visual composition without obscuring or replacing the interactive dashboard preview. Keep it visually secondary to the headline and dashboard preview. Motion is a restrained camera push/pan across the feeding moment; do not suggest the animal or telemetry is live.

## Asset and runtime

Use one local Lottie JSON image layer and the licensed JPEG as its source and static fallback. Store the photo attribution in `src/assets/lottie/ATTRIBUTION.txt`. The user does not need to upload files. Vendor the pinned Lottie-compatible web runtime locally so no new runtime network dependency is introduced.

## Accessibility and states

- Treat the animation as decorative and hide it from assistive technology; the page's existing text remains the source of meaning.
- Respect `prefers-reduced-motion`: show the still photo by default, with a visible Play control for explicit opt-in; otherwise auto-play the Lottie camera move.
- Pause playback while the hero is outside the viewport or the page is hidden.
- Do not label the visual `LIVE`, report sensor values, or imply hardware connectivity.
- Keep the layout usable at mobile and desktop widths and in all landing-page themes.

## Verification

Validate the JSON structure and runtime load, verify the fallback and reduced-motion path, check for console/resource errors, and test the landing hero at mobile and desktop widths. Run the full project test suite and preserve the user/admin boundaries.

## Self-review

Scope is limited to the landing hero. The vector illustration was replaced with a real, attributed photograph after the user rejected the cartoon look. Lottie now adds a restrained camera move only; the visible Play control provides explicit opt-in under reduced motion. No sensor/status motif, unsupported metrics, external runtime, or new navigation is introduced.

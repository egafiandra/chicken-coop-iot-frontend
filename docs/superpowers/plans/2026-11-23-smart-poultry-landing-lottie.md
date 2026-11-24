# Smart Poultry Landing Lottie Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local Lottie camera push/pan over a real, attributed hen-feeding photograph in the Smart Poultry landing hero.

**Architecture:** Use a licensed local JPEG of a real hen eating from a feeder as both the static poster and the image layer in a short Lottie camera push/pan. Store attribution beside the asset. Vendor the pinned `lottie-web` runtime locally so the static landing page has no new runtime network dependency. Keep playback lifecycle in a small, dependency-injected hero-only initializer that respects reduced motion, supports explicit play/pause, pauses when hidden/offscreen, and keeps the photo visible when playback fails.

**Tech Stack:** Static HTML/CSS, browser JavaScript modules, Lottie JSON, `lottie-web` 5.13.0 SVG light build, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-23-smart-poultry-landing-lottie-design.md`

## Global Constraints

- Scope is limited to the landing page, `src/hero-lottie.mjs`, local Lottie assets/runtime, and landing tests. Do not edit user Pro, Lite, or admin behavior.
- Preserve the interactive dashboard preview and all existing links/routes.
- Use the approved Smart Poultry palette: Forest Green `#006B35`, Deep Green `#00843D`, Fresh Green `#55B82A`, Golden Yellow `#FFB515`, Cream `#FFF4D8`.
- Animation is illustrative, never a live sensor or hardware connection claim.
- Use a real photo rather than generated/cartoon art; preserve its source attribution in `src/assets/lottie/ATTRIBUTION.txt`.
- Respect `prefers-reduced-motion`; show the still photo and an explicit Play control instead of autoplaying.
- Keep the local photo fallback visible if runtime initialization or JSON loading fails.
- Do not push unless separately requested.

## Review Focus

- Reduced-motion preference: runtime must not autoplay, the real photo remains visible, and the Play control opts in only after an explicit click. Tests: `reduced motion shows poster without initializing player` and `reduced-motion play control explicitly starts the animation`.
- Missing runtime or malformed/unavailable animation JSON: page remains complete and the photo remains visible. Tests: `missing player leaves poster visible` and `failed animation data restores poster`.
- Hero leaves viewport or browser tab becomes hidden: pause; resume only when visible again. Tests: `animation pauses offscreen and resumes in view` and `animation pauses while hidden and resumes when visible`.
- Narrow viewport and each landing theme: photo and control stay within hero bounds. Browser check at 320 px, 390 px, and desktop in Siang/Sore/Malam.
- Animation data could accidentally imply real telemetry: the single photo layer contains no sensor/status names or numerical labels. Test: `hen animation contains no telemetry values, status indicators, or live-status text`.

---

### Task 1: Add the original animation assets and runtime

**Files:**
- Create: `src/assets/lottie/coop-hen.json`
- Create: `src/assets/lottie/coop-hen-poster.jpg`
- Create: `src/assets/lottie/ATTRIBUTION.txt`
- Create: `src/vendor/lottie-light.min.js` from `lottie-web@5.13.0`
- Create: `src/vendor/lottie-web.LICENSE.txt`
- Test: `tests/landing.test.mjs`

**Interfaces:**
- Produces: `coop-hen.json`, a Bodymovin/Lottie image-layer camera move over the local `coop-hen-poster.jpg`; a `CC BY 4.0` credit in `ATTRIBUTION.txt`; and local `window.lottie` runtime.

- [x] **Step 1: Write failing asset tests** for local photo-JPEG fallback, attribution, Lottie image-layer structure, visible camera push/pan keyframes, and no telemetry/status text. Assert the exact composition and local asset paths; parse JPEG magic bytes and CC BY 4.0 credit.
- [x] **Step 2: Run the focused tests** with `node.exe --test tests/landing.test.mjs`. Expected: FAIL because the Lottie and poster assets do not exist.
- [x] **Step 3: Bundle the real feeding photograph and attribution** in `src/assets/lottie/`, and create the short camera push/pan in the Lottie image layer. The photo is CC BY 4.0; do not recolor it into a cartoon or add sensor/status graphics. Vendor `lottie-web@5.13.0` and its license.
- [x] **Step 4: Run the focused tests** with `node.exe --test tests/landing.test.mjs`. Expected: PASS for all asset assertions.

### Task 2: Integrate accessible playback into the landing hero

**Files:**
- Create: `src/hero-lottie.mjs`
- Modify: `landing.html` hero panel and local script ordering
- Modify: `src/landing.css` hero animation layout and reduced-motion styling
- Modify: `src/landing.mjs` to initialize the hero controller
- Test: `tests/hero-lottie.test.mjs`
- Test: `tests/landing.test.mjs`

**Interfaces:**
- Consumes: local `coop-hen.json`, `coop-hen-poster.jpg`, `window.lottie`, and the existing `prefersReducedMotion` value.
- Produces: `initHeroLottie({ container, fallback, observerTarget, control, lottie, reducedMotion, IntersectionObserverCtor, visibilityTarget, animationPath }) -> cleanup function` in `src/hero-lottie.mjs`; `src/landing.mjs` calls it for the decorative photo layer and accessible play/pause control.

- [x] **Step 1: Write failing landing markup tests** for the local photo fallback, `aria-hidden` artwork, and keyboard-accessible Play/Pause button. Assert local runtime before the module and the Lottie photo path.
- [x] **Step 2: Run the focused landing test** with `node.exe --test tests/landing.test.mjs`. Expected: FAIL because the hero markup does not yet include the animation.
- [x] **Step 3: Write failing lifecycle unit tests** for reduced-motion opt-in, play/pause state, missing player, load failure, offscreen/hidden pause-resume, and cleanup. Inject the player, observer, visibility target, and button; assert fallback/control states and listener cleanup.
- [x] **Step 4: Run the focused lifecycle tests** with `node.exe --test tests/hero-lottie.test.mjs`. Expected: FAIL because `src/hero-lottie.mjs` does not exist.
- [x] **Step 5: Implement `initHeroLottie(...)`** with a local SVG image layer, camera push/pan keyframes, auto-play only when reduced motion is off, explicit opt-in otherwise, a stable hero-wrapper observer, page-visibility pause/resume, and load-failure fallback. Do not animate sensor indicators or alter unrelated hero content.
- [x] **Step 6: Add the photo and accessible motion control** in `landing.html`, initialize the controller with `#hero-hen-toggle`, and style the crop/fallback/control in `src/landing.css`. Keep the play/pause target at least 44 px.
- [x] **Step 7: Run focused tests** with `node.exe --test tests/hero-lottie.test.mjs tests/landing.test.mjs`. Expected: PASS.

### Task 3: Verify the running landing page

**Files:**
- Verify: `landing.html`, `src/landing.css`, `src/landing.mjs`, and local Lottie assets
- Test: `tests/landing.test.mjs` and the full `tests/*.test.mjs` suite

**Interfaces:**
- Consumes: completed local assets and hero playback behavior from Tasks 1–2.
- Produces: verified landing animation behavior and a clean full-suite result.

- [x] **Step 1: Run all tests** with `node.exe --test tests/*.test.mjs`. Expected: all tests pass.
- [x] **Step 2: Run the landing page in a browser** and verify the photo poster, automatic camera motion under no-preference, explicit Play/Pause under reduced motion, offscreen/tab pause-resume, and no console/resource errors.
- [x] **Step 3: Check responsive/theme states** at 320 px, 390 px, and desktop with Siang, Sore, and Malam. Expected: no page overflow, the hen/feeder remain visible in the crop, and the 44 px control stays in bounds.
- [x] **Step 4: Run `git diff --check`** and verify only in-scope landing/Lottie/test files changed; confirm user Pro and admin files are untouched.

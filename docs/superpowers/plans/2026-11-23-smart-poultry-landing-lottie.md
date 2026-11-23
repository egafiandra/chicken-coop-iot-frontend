# Smart Poultry Landing Lottie Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one original, local Lottie hen-and-coop animation to the Smart Poultry landing hero without implying live hardware data.

**Architecture:** Add a small Lottie JSON asset and a static SVG poster fallback. Vendor the pinned `lottie-web` runtime locally so the static landing page has no new runtime network dependency. Keep playback lifecycle in a small, dependency-injected hero-only initializer that honors reduced motion, pauses when hidden/offscreen, and keeps the poster visible when playback fails.

**Tech Stack:** Static HTML/CSS, browser JavaScript modules, Lottie JSON, `lottie-web` 5.13.0, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-23-smart-poultry-landing-lottie-design.md`

## Global Constraints

- Scope is limited to the landing page, `src/hero-lottie.mjs`, local Lottie assets/runtime, and landing tests. Do not edit user Pro, Lite, or admin behavior.
- Preserve the interactive dashboard preview and all existing links/routes.
- Use the approved Smart Poultry palette: Forest Green `#006B35`, Deep Green `#00843D`, Fresh Green `#55B82A`, Golden Yellow `#FFB515`, Cream `#FFF4D8`.
- Animation is illustrative, never a live sensor or hardware connection claim.
- Respect `prefers-reduced-motion`; show the static poster instead of autoplaying.
- Keep local poster fallback visible if runtime initialization or JSON loading fails.
- Do not push unless separately requested.

## Review Focus

- Reduced-motion preference: runtime must not autoplay, and the static poster remains visible. Test: `reduced motion shows poster without initializing player`.
- Missing runtime or malformed/unavailable animation JSON: page remains complete and poster remains visible. Tests: `missing player leaves poster visible` and `failed animation data restores poster`.
- Hero leaves viewport or browser tab becomes hidden: pause; resume only when visible again. Tests: `animation pauses offscreen and resumes in view` and `animation pauses while hidden and resumes when visible`.
- Narrow viewport and each landing theme: animation stays within hero bounds and its fallback remains legible. Test: browser check at 320 px, 390 px, and desktop in Siang/Sore/Malam.
- Animation data could accidentally imply real telemetry: keep sensor pulse purely illustrative and omit numerical labels. Test: `hen animation contains no telemetry values or live-status text`.

---

### Task 1: Add the original animation assets and runtime

**Files:**
- Create: `src/assets/lottie/coop-hen.json`
- Create: `src/assets/lottie/coop-hen-poster.svg`
- Create: `src/vendor/lottie.min.js` from `lottie-web@5.13.0`
- Create: `src/vendor/lottie-web.LICENSE.txt`
- Test: `tests/landing.test.mjs`

**Interfaces:**
- Produces: `coop-hen.json`, a Bodymovin/Lottie animation loaded from a local path; `coop-hen-poster.svg`, a static view of the same hen-and-coop scene; and local `window.lottie` runtime.

- [ ] **Step 1: Write failing asset tests** named `hero Lottie asset has a valid local animation structure`, `hero poster is a local SVG fallback`, and `hen animation contains no telemetry values or live-status text`. Parse JSON, assert `v`, `fr`, `ip`, `op`, `w`, `h`, and `layers`, assert poster SVG dimensions/viewBox, and assert no text layer contains sensor values or `LIVE`.
- [ ] **Step 2: Run the focused tests** with `node --test tests/landing.test.mjs`. Expected: FAIL because the Lottie and poster assets do not exist.
- [ ] **Step 3: Add the minimal hen-pecking animation and poster** using only the approved palette and no numerical/status copy; vendor the runtime and its license from the pinned `lottie-web@5.13.0` package.
- [ ] **Step 4: Run the focused tests** with `node --test tests/landing.test.mjs`. Expected: PASS for all asset assertions.

### Task 2: Integrate accessible playback into the landing hero

**Files:**
- Create: `src/hero-lottie.mjs`
- Modify: `landing.html` hero panel and local script ordering
- Modify: `src/landing.css` hero animation layout and reduced-motion styling
- Modify: `src/landing.mjs` to initialize the hero controller
- Test: `tests/hero-lottie.test.mjs`
- Test: `tests/landing.test.mjs`

**Interfaces:**
- Consumes: local `coop-hen.json`, `coop-hen-poster.svg`, `window.lottie`, and the existing `prefersReducedMotion` value.
- Produces: `initHeroLottie({ container, fallback, lottie, reducedMotion, IntersectionObserverCtor, visibilityTarget, animationPath }) -> cleanup function` in `src/hero-lottie.mjs`; `src/landing.mjs` calls it for the decorative `#hero-chicken-animation` container.

- [ ] **Step 1: Write failing landing markup tests** named `landing hero provides local Lottie runtime and poster fallback`. Assert the container ID, local runtime script before the module, local animation path, poster asset, and `aria-hidden` decorative semantics.
- [ ] **Step 2: Run the focused landing test** with `node --test tests/landing.test.mjs`. Expected: FAIL because the hero markup does not yet include the animation.
- [ ] **Step 3: Write failing lifecycle unit tests** named `reduced motion shows poster without initializing player`, `missing player leaves poster visible`, `failed animation data restores poster`, `animation pauses offscreen and resumes in view`, and `animation pauses while hidden and resumes when visible`. Inject fake player, observer, and visibility target; assert calls, fallback visibility, and cleanup.
- [ ] **Step 4: Run the focused lifecycle tests** with `node --test tests/hero-lottie.test.mjs`. Expected: FAIL because `src/hero-lottie.mjs` does not exist.
- [ ] **Step 5: Implement `initHeroLottie(...)`** with SVG renderer, looping idle playback, static reduced-motion behavior, IntersectionObserver and page-visibility pause/resume, and an error path that leaves the poster visible. Keep the hero animation subordinate to the existing preview and limit CSS changes to the hero.
- [ ] **Step 6: Add the hero container and local script ordering** in `landing.html`, initialize `initHeroLottie(...)` from `src/landing.mjs`, and add responsive/fallback styling in `src/landing.css`.
- [ ] **Step 7: Run focused tests** with `node --test tests/hero-lottie.test.mjs tests/landing.test.mjs`. Expected: PASS.

### Task 3: Verify the running landing page

**Files:**
- Verify: `landing.html`, `src/landing.css`, `src/landing.mjs`, and local Lottie assets
- Test: `tests/landing.test.mjs` and the full `tests/*.test.mjs` suite

**Interfaces:**
- Consumes: completed local assets and hero playback behavior from Tasks 1–2.
- Produces: verified landing animation behavior and a clean full-suite result.

- [ ] **Step 1: Run all tests** with `node --test tests/*.test.mjs`. Expected: all tests pass.
- [ ] **Step 2: Run the landing page in a browser** and verify animation playback, poster fallback, reduced-motion mode, pause/resume after scrolling away and returning, and no console/resource errors.
- [ ] **Step 3: Check responsive/theme states** at 320 px, 390 px, and desktop, with Siang, Sore, and Malam selected. Expected: no overflow, clipped artwork, or contrast loss.
- [ ] **Step 4: Run `git diff --check`** and verify only in-scope landing/Lottie/test files changed; confirm user Pro and admin files are untouched.

# Smart Poultry Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Smart Poultry home dashboard around the approved illustrated “Pagi di Kandang” direction while preserving its current user features and fixture data.

**Architecture:** Add a small, testable dashboard view model in `state.mjs`, render the Home page through a focused `home-dashboard.mjs` function, and add one local SVG coop illustration plus responsive styles. Keep existing routes, state handling, authentication/preview flow, and dependencies unchanged.

**Tech Stack:** Vanilla JavaScript modules, CSS, SVG, Node.js built-in test runner, real-browser verification.

**Spec:** `docs/superpowers/specs/2026-11-10-smart-poultry-dashboard-design.md`

## Global Constraints

- Design Read dials: ENERGY 2 / RHYTHM 2 / MOTION 1.
- The reference contributes its illustrated outdoor scene, layered information panel, and bottom navigation. Smart Poultry keeps its own forest-green and warm-neutral identity, with sky blue and field green used only in the coop illustration.
- Use a simple, original vector-style scene of a chicken coop, field, and a few chicken silhouettes. Do not add human characters, generated photos, or external image assets. Keep all text on solid surfaces for contrast.
- Keep the existing values and notifications only; do not invent telemetry.
- Do not add admin, weight, water-flow/debit, YOLO, history, or new routes.
- Keep all device controls local-only and retain truthful disconnected-camera/IoT statuses.
- Keep the lamp as one fixed red + warm-white mode.
- Use the existing calm active-state treatment and visible keyboard focus. No glow or looping animation.
- Existing DEMO and connection-state disclosures remain accurate.
- At 390 px and 715 px, the hero, metrics, and bottom navigation must fit without horizontal scroll.
- Workflow constraint: do not push or commit unrelated local app changes.

## Review Focus

1. At 390 px and 715 px, the hero, metrics, and bottom navigation must fit without horizontal scroll. The Task 3 browser width sweep checks both `scrollX` and `documentElement.scrollWidth`.
2. A long profile name must not push hero content off-screen. Task 3 uses the demo profile editor with an 80-character name and then checks Home at mobile widths.
3. The disconnected camera/IoT state must remain clear and must not look like a live feed. Task 3 checks the Home and Camera routes for their disconnected labels.
4. If the SVG fails to load, its accessible alternative text and the solid hero text surface must remain legible. Task 2 tests the SVG title/viewBox/description and the `<img>` alt text; Task 3 checks the rendered image request.
5. Keyboard focus and reduced-motion behavior must remain usable after the home layout changes. Task 3 tabs through mobile navigation and checks the reduced-motion media query.

---

### Task 1: Add a testable home-dashboard view model

**Files:**
- Modify: `src/state.mjs`
- Test: `tests/state.test.mjs`

**Interfaces:**
- Produces: `getHomeDashboardModel(state) -> { displayName, connectionLabel, flockCount, temperatureC, humidityPercent, feedLabel, valveLabel, lightingLabel, musicLabel, musicVolume, unreadNotifications, notifications }`, using existing state values and the first two notification items only.
- Consumes: existing `createInitialState()`, `toggleControl()`, and current notification fixture shape.

- [ ] **Step 1: Write failing tests** for the default fixture values and for valve/lamp/music labels after toggles. Assert the model does not add weight or water-flow fields.
- [ ] **Step 2: Run the focused test** with `node.exe --test tests/state.test.mjs`. Expected: FAIL because `getHomeDashboardModel` is not exported.
- [ ] **Step 3: Implement `getHomeDashboardModel(state)`** in `src/state.mjs`, deriving labels from current state without changing state or inventing values.
- [ ] **Step 4: Re-run the focused test** and the full state test file. Expected: all pass.

### Task 2: Build the illustrated “Pagi di Kandang” dashboard

**Files:**
- Create: `src/coop-scene.svg`
- Create: `src/assets/stitch/coop-home.jpg`
- Create: `src/assets/stitch/coop-controls.jpg`
- Create: `src/assets/stitch/coop-camera.jpg`
- Create: `src/home-dashboard.mjs`
- Modify: `src/main.mjs`
- Test: `tests/home-dashboard.test.mjs`
- Test: `tests/stitch-assets.test.mjs`

**Interfaces:**
- Consumes: `getHomeDashboardModel(state)` from Task 1.
- Produces: `renderHomeDashboard(model, helpers) -> HTML string`. `helpers` supplies the existing `icon(name)`, `sectionHeading(title, detail, action)`, `statePill(label, tone)`, and `escapeHTML(value)` functions from `main.mjs`.
- The three JPEGs are local copies of user-provided Stitch assets: home camera thumbnail, controls-page context photo, and camera-page still image. They must never be presented as live footage.

- [ ] **Step 1: Write failing tests**: renderer assertions for the SVG, descriptive alt text, the environment masthead values, all four existing quick-route tiles, device/notification sections, and absence of weight, water-flow, YOLO, and history content; asset tests for JPEG signatures and size on all three local files.
- [ ] **Step 2: Run focused tests** with `node.exe --test tests/home-dashboard.test.mjs tests/stitch-assets.test.mjs`. Expected: FAIL because the local photo files and Home photo reference do not exist yet.
- [ ] **Step 3: Copy the three selected photos from the downloaded ZIP assets** to `src/assets/stitch/`. Do not copy the Stitch HTML/screenshots as app code, do not use external image URLs, and exclude the history/YOLO image and the mismatched CoopIoT logo.
- [ ] **Step 4: Create `src/coop-scene.svg`** as a compact original vector scene of a coop, field, and chicken silhouettes; do not include people or telemetry text. Add an SVG title and description.
- [ ] **Step 5: Implement `renderHomeDashboard(model, helpers)`** in `src/home-dashboard.mjs`. Group temperature, humidity, feed, and valve into one environmental masthead; add four links to existing routes in a 2×2 quick-access grid, using the home Stitch photo in the Camera tile. Keep the SVG hero and the other static images explicitly offline. Update `renderHome()` in `main.mjs` to build the model from Task 1 and delegate to this renderer.
- [ ] **Step 6: Run the focused tests and full suite.** Expected: all tests pass; no new dependency is added.

### Task 3: Apply responsive styling and verify the complete home route

**Files:**
- Modify: `src/main.mjs`
- Modify: `src/user-mobile.css`
- Modify: `DESIGN.md`
- Modify: `README.md`
- Verify: the running Smart Poultry app in a real browser

**Interfaces:**
- Consumes: the home markup and SVG from Task 2.
- Produces: the approved mobile and desktop compositions while retaining existing navigation and controls.

- [ ] **Step 1: Style the hero, home camera thumbnail, controls context photo, and camera-page still** with the approved palette, solid text surfaces, calm active states, and explicit disconnected labels on all static camera imagery.
- [ ] **Step 2: Add responsive rules** for a stacked mobile hero, two-column quick-access tiles on phones, four tiles on wide screens, a grouped environmental masthead, 44 px minimum tap targets, focus visibility, and reduced motion.
- [ ] **Step 3: Update `DESIGN.md`** to record the selected “Pagi di Kandang” direction and its illustration/layout decisions.
- [ ] **Step 4: Verify the Home route** by opening the app, using “Masuk sebagai pengguna demo,” and checking the hero, in-hero connection state, local Home photo, and links. Open Controls and Camera to confirm their local photos load with disconnected labels, not a live-feed claim.
- [ ] **Step 5: Sweep widths** 390 px, 715 px, and 1280 px. Expected: no horizontal overflow, all six routes remain navigable, and camera/IoT states remain truthful.
- [ ] **Step 6: Run `node.exe --test tests/*.test.mjs` and `node.exe --check` on the modified modules.** Report browser checks separately from automated test results.

---

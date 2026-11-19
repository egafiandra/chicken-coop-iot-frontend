# User Lite/Pro Modes and Home Monitoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the user Monitoring view into Beranda and add Lite/Pro edition switching in Pengaturan, with Pro as a user-only dashboard inspired by the admin visual hierarchy.

**Architecture:** Add a small user-edition preference module for safe local-storage reads/writes. Compose existing monitoring charts/device status into Beranda while keeping one set of sensor summaries. Render Pro from a dedicated user-dashboard module using the same user state and routes; do not embed or import the admin application.

**Tech Stack:** Vanilla JavaScript ES modules, CSS, Node.js built-in test runner, browser verification.

**Spec:** `docs/superpowers/specs/2026-11-19-user-lite-pro-modes-design.md`

## Global Constraints

- Implement the requested edition and monitoring revisions only in the user-facing application.
- The user app and admin app remain separate.
- Do not edit `admin.html`, `src/admin/**`, admin state, admin navigation, or admin behavior.
- Lite is the current user-facing application.
- Pro displays a dedicated user dashboard built from existing user data and routes.
- Do not embed, import, or display `admin.html` from Pro.
- Keep the mode choice in local browser storage. Start new browsers in Lite mode.
- Preserve current fixture telemetry and disconnected IoT/camera disclosures; add no new sensor values or backend behavior.

## Review Focus

- Storage missing, throwing, or containing an unknown edition must resolve to Lite; test each case in Task 1.
- Legacy `#/monitor` and `#/profile` bookmarks must resolve to the intended pages after route changes; test aliases in Task 2.
- Home already contains environment readings duplicated by Monitoring; test that moved charts/device status appear once and environment values are not duplicated in Task 2.
- Switching to Pro while on settings and reloading while Pro is selected must leave all user routes accessible; test mode routing in Task 3.
- Pro must show no admin-only values or functions and must not render an iframe; test its content and verify admin files remain unchanged in Task 3.

---

### Task 1: Add a safe user-edition preference module

**Files:**
- Create: `src/user-edition.mjs`
- Create: `tests/user-edition.test.mjs`

**Interfaces:**
- Produces `USER_EDITION_STORAGE_KEY = 'smart-poultry-user-edition-v1'`.
- Produces `normalizeUserEdition(value) -> 'lite' | 'pro'`; every value other than `'pro'` normalizes to `'lite'`.
- Produces `readUserEdition(storage) -> 'lite' | 'pro'`; reads the key safely and defaults to Lite for null storage, thrown access, or invalid stored values.
- Produces `writeUserEdition(storage, edition) -> boolean`; stores only the normalized value and returns false if storage is unavailable or throws.

- [ ] **Step 1: Write failing tests** named `defaults to Lite for missing or invalid preferences`, `reads a saved Pro preference`, and `handles unavailable or throwing storage safely`. Assert invalid values never select Pro and failed writes return false.
- [ ] **Step 2: Run the focused tests** with `node --test tests/user-edition.test.mjs`. Expected: FAIL because the module is not implemented.
- [ ] **Step 3: Implement the three exported interfaces** in `src/user-edition.mjs`, wrapping both storage access and writes in `try/catch`.
- [ ] **Step 4: Run the focused tests** with `node --test tests/user-edition.test.mjs`. Expected: all pass.

### Task 2: Move Monitoring content into Beranda and update user routes

**Files:**
- Modify: `src/state.mjs`
- Modify: `src/main.mjs`
- Modify: `src/home-dashboard.mjs`
- Modify: `src/monitor-dashboard.mjs`
- Modify: `tests/state.test.mjs`
- Modify: `tests/home-dashboard.test.mjs`
- Modify: `tests/monitor-dashboard.test.mjs`

**Interfaces:**
- `renderMonitorDetails(model, helpers) -> HTML string` in `src/monitor-dashboard.mjs` renders the existing trend charts and device status only, without the repeated environment masthead.
- `renderMonitorDashboard(model, helpers) -> HTML string` remains available and composes its current environment masthead with `renderMonitorDetails` for existing renderer tests.
- `renderHomeDashboard(model, helpers, monitorDetails = '') -> HTML string` appends the supplied monitor details to current home content and removes the Monitoring quick-access link.
- `normalizePage('monitor') -> 'home'`, `normalizePage('profile') -> 'settings'`; supported user page IDs replace `monitor/profile` with `settings` and include the internal `pro` page.

- [ ] **Step 1: Add failing route and render tests.** In `tests/state.test.mjs`, assert old `monitor` resolves to `home`, old `profile` resolves to `settings`, and `settings`/`pro` remain valid. In home tests, assert monitor trends and device status appear in home once and no `#/monitor` link remains. In monitor tests, assert `renderMonitorDetails` contains both charts and device status but no masthead.
- [ ] **Step 2: Run the focused tests** with `node --test tests/state.test.mjs tests/home-dashboard.test.mjs tests/monitor-dashboard.test.mjs`. Expected: FAIL on the new route aliases and renderer composition.
- [ ] **Step 3: Extract `renderMonitorDetails(model, helpers)`** and compose it inside the existing `renderMonitorDashboard` without changing chart values or status text.
- [ ] **Step 4: Update `renderHomeDashboard`** to append monitor details and remove only its Monitoring quick-access tile; retain controls, camera, and notifications links.
- [ ] **Step 5: Update `src/state.mjs` and `src/main.mjs`** so the Lite pages use Beranda, Kontrol, Kamera, Notifikasi, and Pengaturan; legacy routes normalize as specified. Build monitor model from the existing fixture values when rendering Beranda.
- [ ] **Step 6: Re-run the focused tests.** Expected: all pass, with no duplicate environment section and existing out-of-scope telemetry assertions intact.

### Task 3: Add user-only edition selection and embedded Pro view

**Files:**
- Modify: `src/main.mjs`
- Modify: `src/user-mobile.css`
- Create: `src/user-edition-view.mjs`
- Create: `src/user-pro-dashboard.mjs`
- Create: `tests/user-edition-ui.test.mjs`
- Create: `tests/user-pro-dashboard.test.mjs`
- Verify: browser at `http://127.0.0.1:4174/`

**Interfaces:**
- `renderEditionSettings(activeEdition) -> HTML string` in `src/user-edition-view.mjs` produces the accessible Lite/Pro controls with a visible selected state and `aria-pressed` values.
- `renderSettingsShortcut(icon) -> HTML string` produces the user-only gear link to Pengaturan.
- `renderUserProDashboard(model, helpers) -> HTML string` in `src/user-pro-dashboard.mjs` renders only existing user metrics, statuses, notification preview, and links to user routes.
- The user navigation page is `settings` with label `Pengaturan`; its renderer retains the existing profile form and uses `renderEditionSettings`.
- In Lite, retain the current user navigation. In Pro, use `proPage` plus the existing user controls/camera/notifications/settings routes; the Pro dashboard is not an iframe.
- Initialize the edition from `readUserEdition(localStorage)`; edition controls update in-memory state and persist through `writeUserEdition`.
- `admin.html` and `src/admin/**` remain unchanged.

- [ ] **Step 1: Add failing tests.** In `tests/user-edition-ui.test.mjs`, cover Lite/Pro selected states and the labeled settings shortcut. In `tests/user-pro-dashboard.test.mjs`, assert existing user metrics/statuses and user routes render, admin-only values/functions and iframe do not, and values are escaped.
- [ ] **Step 2: Run the focused tests** with `node --test tests/user-edition-ui.test.mjs tests/user-pro-dashboard.test.mjs`. Expected: FAIL because the new Pro renderer is not implemented.
- [ ] **Step 3: Implement `renderUserProDashboard(model, helpers)`** in `src/user-pro-dashboard.mjs` using only the approved user data: flock count, temperature, humidity, feed, valve, lamp, music, unread notifications, and existing notification preview. Add links to user controls, camera, and notifications; do not calculate unsupported metrics.
- [ ] **Step 4: Implement edition routing in `src/main.mjs`.** Pro must render the user dashboard at `#/pro` and preserve user Controls/Camera/Notifications/Settings routes. Remove the old iframe renderer/import. Settings remains accessible to switch back to Lite.
- [ ] **Step 5: Style the Pro user dashboard** in `src/user-mobile.css` with an admin-inspired summary, four user metric cards, device statuses, and notification panel. Do not reuse admin CSS or edit `src/admin/**`.
- [ ] **Step 6: Run focused tests** with `node --test tests/user-edition-ui.test.mjs tests/user-pro-dashboard.test.mjs`. Expected: all pass, including absence of iframe/admin content.
- [ ] **Step 7: Verify in a browser** at 390 px and desktop width: Settings switches Lite/Pro, Pro displays user-only data, links to user routes work, Settings remains reachable, and there is no horizontal overflow.
- [ ] **Step 8: Verify admin files are unchanged** with `git diff --exit-code -- admin.html src/admin` and run `node --test tests/*.test.mjs`. Expected: no admin diff and all tests pass.

## Final Verification

Run `node --test tests/*.test.mjs`, `git diff --check`, and the browser checks above. Report any remaining local commits or unrelated working-tree changes separately; do not push unless the user explicitly asks.

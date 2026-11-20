# User Lite/Pro Modes and Home Monitoring

Date: 2026-11-19
Status: Revised design approved in conversation; awaiting written-spec review before implementation.

## Scope

Implement the edition and monitoring revisions only in the user-facing application. The user app and admin app remain separate. Do not edit `admin.html`, `src/admin/**`, admin state, admin navigation, or admin behavior; the user's friend will handle future Lite/Pro selection in the admin app.

Pro is a new user-facing dashboard in the existing user SPA. It follows the admin screenshot's visual language and may load `src/admin/styles.css` as a read-only visual CSS asset, but it uses only user-facing data and functions. It must not embed or import admin HTML, JavaScript, state, routes, or data.

## User decisions

- Move the complete existing Monitoring content to Beranda.
- Remove the separate Monitoring navigation item and Monitoring quick-access link.
- Rename the user Profil navigation/page to Pengaturan, retaining the existing profile form.
- Put the Lite and Pro choices in the user Pengaturan page.
- Provide an explicit gear shortcut labeled Pengaturan in the user header; keep the sidebar/bottom-navigation Pengaturan entry.
- Lite is the current user-facing application and remains unchanged apart from the Monitoring move and Settings entry.
- Pro is a dedicated user-facing dashboard in the same SPA, styled with cues from the admin screenshot: dark-green navigation, a clear operational summary, compact metric cards, and a device/status area.
- Pro navigation remains user-only: Beranda/Pro, Kontrol, Kamera, Notifikasi, and Pengaturan.
- Leave all admin-side edition controls for the friend to implement later.
- Keep the mode choice in local browser storage. Start new browsers in Lite mode.

## Monitoring on Beranda

Move the current `renderMonitorDashboard` content—environment summary, 30-minute temperature/humidity charts, and device status—into Beranda alongside the current home content. Avoid showing duplicate monitoring summaries where the current home already displays the same values. Remove the Monitoring link from the home quick-access area and the main navigation on desktop and mobile.

Preserve compatibility for old `#/monitor` links by normalizing that route to `home`. Do not remove or invent sensor fields, fixture values, or device behavior.

## Lite/Pro selection

Add an edition section to the user Pengaturan page with two accessible controls labeled Lite and Pro, and a visible selected state. Keep the profile editor and explicit header gear shortcut available.

- Lite restores the existing user application view.
- Pro opens the user-facing Pro dashboard within the existing user SPA. Preserve access to user Kontrol, Kamera, Notifikasi, and Pengaturan routes.
- Persist the selected edition locally; if storage is unavailable or invalid, default safely to Lite. Restore the selected view after reload while keeping login/signup accessible.
- Treat this as a presentation mode, not an authorization or role change.

## Pro user dashboard

Use the screenshot only as a visual reference for layout and hierarchy. Adapt a dark-green user navigation rail, a concise summary area, compact metric cards, and a device/status section. Build the Pro dashboard from the existing user state/model only:

- Flock count and current temperature/humidity fixture values.
- Feed availability and valve state.
- Lamp and music state, including the existing fixed lamp mode and volume.
- Existing unread notification count and links to user routes.
- Existing demo/disconnected-IoT disclosures.

Do not display admin-only concepts or data: user/account administration, multiple registered coops, device registration/online totals, admin rules/automation, admin logs, or admin demo records. Do not invent a health percentage, device total, alert severity, or sensor metric that the user model does not supply. Do not render an iframe or reuse admin application markup, JavaScript, state, routes, or data; the existing admin stylesheet is allowed only as a read-only visual asset.

## Existing behavior to preserve

- Keep the user profile name, email, and phone editing form.
- Preserve current login, signup, logout, controls, camera, notification, time-theme, demo, and disconnected-device behavior.
- Keep `admin.html` and `src/admin/**` unchanged.
- Do not add backend connectivity or real sensor claims.

## Acceptance criteria

1. Beranda contains current home content and the complete former Monitoring sections, without duplicating the environment summary.
2. Monitoring is absent from desktop/mobile navigation and quick access; legacy `#/monitor` resolves to Beranda.
3. User Pengaturan keeps profile editing and Lite/Pro controls; the header gear shortcut visibly opens Pengaturan.
4. Lite continues to show the existing user app.
5. Pro shows a distinct user-only dashboard with the approved admin-inspired hierarchy, using only existing user data; it contains no admin iframe, admin management functions, or admin demo values.
6. Pro retains user-only navigation to Kontrol, Kamera, Notifikasi, and Pengaturan.
7. The selected edition persists locally; a fresh browser defaults to Lite, and unavailable/invalid storage falls back to Lite.
8. `admin.html` and `src/admin/**` are unchanged.
9. Existing tests pass, new tests cover mode routing and Pro dashboard composition, and browser checks cover desktop/mobile layouts without horizontal overflow.

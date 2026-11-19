# User Lite/Pro Modes and Home Monitoring

Date: 2026-11-19
Status: Design approved in conversation; awaiting written-spec review before implementation.

## Scope

Implement the requested edition and monitoring revisions only in the user-facing application. The user app and the admin app remain separate. Do not edit `admin.html`, `src/admin/**`, admin state, admin navigation, or admin behavior; the user's friend will handle future Lite/Pro selection in the admin app.

The existing admin page is used as the Pro content inside the user app. It remains its own document and keeps its own UI, code, and state.

## User decisions

- Move the complete existing Monitoring content to Beranda.
- Remove the separate Monitoring navigation item and Monitoring quick-access link.
- Rename the user Profil navigation/page to Pengaturan, retaining the existing profile form.
- Put the Lite and Pro choices in the user Pengaturan page.
- Lite is the current user-facing application.
- Pro displays the existing admin page embedded in the user application's content area. Keep the user app shell/navigation around it so the user can return to Pengaturan and select Lite.
- Keep the mode choice in local browser storage. Start new browsers in Lite mode.
- Leave all admin-side edition controls for the friend to implement later.

## Monitoring on Beranda

Move the current `renderMonitorDashboard` content—environment summary, 30-minute temperature/humidity charts, and device status—into Beranda alongside the current home content. Avoid showing duplicate monitoring summaries where the current home already displays the same values. Remove the Monitoring link from the home quick-access area and the main navigation on desktop and mobile.

Preserve compatibility for old `#/monitor` links by normalizing that route to `home`. Do not remove or invent sensor fields, fixture values, or device behavior.

## Lite/Pro selection

Add an edition section to the user Pengaturan page with two accessible controls labeled Lite and Pro, and a visible selected state.

- Lite restores the existing user application view.
- Pro renders the existing `admin.html` inside an accessible iframe in the user app content area. Give the iframe an informative title and ensure it can use the available content width and height without creating nested horizontal scrolling.
- Keep the user app navigation available outside the embedded panel, including Pengaturan, so the user can switch back to Lite.
- Store the selected edition in local storage; if storage is unavailable or invalid, default safely to Lite. Restore the selected view after reload while keeping the outer user navigation available.
- This is a presentation switch only. Do not merge account/authentication, role, or state models between user and admin apps, and do not claim the user gains admin authorization.

The Pro view intentionally displays the existing admin demo, including its existing demo data and disclosures. Do not alter the admin page to add its own Lite/Pro switch.

## Existing behavior to preserve

- Keep the user profile name, email, and phone editing form.
- Preserve current login, signup, logout, controls, camera, notification, time-theme, demo, and disconnected-device behavior.
- Keep the existing admin page unchanged.
- Do not add backend connectivity or real sensor claims.

## Acceptance criteria

1. Beranda contains current home content and the complete former Monitoring sections, with no duplicated sensor summary.
2. Monitoring is absent from desktop/mobile navigation and quick access; navigating to legacy `#/monitor` resolves to Beranda.
3. The user menu reads Pengaturan, and its page retains profile editing plus Lite/Pro selection.
4. Selecting Lite displays the current user app; selecting Pro embeds `admin.html` within the user app shell, and the outer Pengaturan navigation remains usable to return to Lite.
5. The selected edition persists locally; a fresh browser defaults to Lite, and unavailable/invalid storage falls back to Lite.
6. `admin.html` and `src/admin/**` are unchanged.
7. Existing tests pass, new tests cover route/mode selection and render composition, and browser verification confirms navigation and iframe sizing at mobile and desktop widths.

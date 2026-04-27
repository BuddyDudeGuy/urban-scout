# Screenshot Manifest

This folder holds the screenshots referenced from the final report's User Guide section (`docs/final-report/sections/06-user-guide.tex`). To fill the folder, run the app locally (see Setup in the User Guide), sign in with the listed account, navigate to the listed page, and save a screenshot using the exact filename in the table below. PNG format, ideally taken on a phone-sized viewport (around 390 by 844 px) or with the browser dev tools mobile emulator on so the bottom Navbar and mobile layout are visible.

The report compiles whether or not these files exist. Each `\includegraphics` call is wrapped in `\IfFileExists`, so any missing screenshot renders as a labeled placeholder box at the same size. Drop the PNG in with the right name and the box is automatically replaced on the next compile.

| # | Filename | Page / URL | Account to log in as | What to capture |
|---|---|---|---|---|
| 1 | `01-login.png` | `/login` | (signed out) | Login screen with the email field and the User/Admin toggle visible. |
| 2 | `02-register.png` | `/register` | (signed out) | Register form with name, email, and the home city dropdown open or visible. |
| 3 | `03-home.png` | `/` | alice@example.com (User) | Home page showing the Seoul hero banner, the stats row, and at least two region cards with their Subscribe/Unsubscribe buttons. |
| 4 | `04-places.png` | `/places` | alice@example.com (User) | Places page with the type filter pills at the top, the region dropdown, and a grid of at least four place cards. |
| 5 | `05-place-detail.png` | `/places/:id` (any landmark) | alice@example.com (User) | Place detail page showing the hero image, info panel, the Leaflet map, the nearby transit list, and the Add to Itinerary dropdown. |
| 6 | `06-transit.png` | `/transit` | alice@example.com (User) | Transit page with a route expanded, a station picked from the dropdown, and the arrivals/departures/serving routes panel visible. |
| 7 | `07-news.png` | `/news` | alice@example.com (User) | News page with the region filter pills, at least one news card, severity badges visible, and at least one red Safety Alert box rendered. |
| 8 | `08-incident-form.png` | `/incidents/new` | bob@example.com (User) | Incident page showing both columns. My Reports list on the left and the New Report form on the right with the severity pills visible. |
| 9 | `09-incident-success.png` | `/incidents/new` | bob@example.com (User) | Same page just after a submit, with the green success banner showing and the new Pending report at the top of My Reports. |
| 10 | `10-trips-list.png` | `/itineraries` | bob@example.com (User) | Itineraries page with at least two trip cards visible and the New Trip form expanded showing the title field and two native date pickers. |
| 11 | `11-trip-detail.png` | `/itineraries/:id` | bob@example.com (User) | Itinerary detail page with several items listed, ideally one row in edit mode so the inline date picker and note field are visible. |
| 12 | `12-admin-dashboard.png` | `/admin` | soyeon@urbanscout.io (Admin) | Admin dashboard with all five stat cards visible (Pending Reports, News Posts, Places, Routes, Total Reports) and the recent pending reports preview below them. |
| 13 | `13-admin-verify.png` | `/admin/reports` | soyeon@urbanscout.io (Admin) | Verify Reports page with the status filter tabs across the top, at least one Pending row showing the Confirm and Reject buttons, and a mix of statuses in the list. |
| 14 | `14-admin-news.png` | `/admin/news` | minho@urbanscout.io (Admin) | Manage News page with the existing posts list at the top and the New Post form below, with the optional Safety Alert section expanded so the alert type dropdown and area field are visible. |
| 15 | `15-admin-routes.png` | `/admin/routes` | jisoo@urbanscout.io (Admin) | Manage Routes page showing the create-route form, the list of existing routes, and at least one route with its Manage Stops panel expanded. The station dropdown and transit vehicle dropdown should both be visible, plus the Add Stop button and a couple of existing stops with Remove buttons. |
| 16 | `16-admin-places.png` | `/admin/places` | soyeon@urbanscout.io (Admin) | Manage Places page with the form visible. Pick the Landmark, Eatery, or Transit Station subtype from the dropdown so the subtype-specific fields (opening hours, average cost, or station code) are showing in the lower half of the form. |

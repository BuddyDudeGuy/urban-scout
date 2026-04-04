# Urban Scout

### Unified Mobile Tourist Assistant for Seoul

> CPSC 471 - Data Base Management Systems
> University of Calgary, Winter 2026
> Group 61

---

## Team

| Name | Role |
|------|------|
| Sean Kim | Developer |
| Muhtasim Ishmam | Developer |
| Talha Hussain Mahr | Developer |

---

## What Is This?

Urban Scout is a mobile-friendly web app for tourists visiting Seoul, South Korea. Instead of switching between Google Maps, TripAdvisor, transit apps, and local news sites, everything is in one place.

**The problem:** Tourists end up juggling a bunch of different apps just to find restaurants, check bus times, read local news, and plan their day.

**Our solution:** One app that puts all of that in one place, backed by a relational database that ties landmarks, eateries, transit stations, news, safety alerts, and trip planning together.

---

## Features

### For Tourists (Users)

- **Subscribe to regions** you are visiting (Downtown Seoul, Gangnam, Hongdae)
- **Browse places** with filters for landmarks, eateries, and transit stations
- **View place details** with a map, nearby transit stations, and walking distances
- **Check transit schedules** with arrival and departure times for any station
- **Read news and safety alerts** for your subscribed regions
- **Report incidents** like theft, road hazards, or overcrowding
- **Track your reports** and see if an admin has verified them
- **Plan trips** by creating itineraries and adding places to visit

### For Admins

- **Dashboard** with stats on pending reports, news posts, and places
- **Verify or reject** incident reports submitted by users
- **Publish news posts** with optional safety alerts for specific regions

### Minimal Keyboard Input

The app is built so you rarely need to type anything. Most interactions are just clicking or tapping:

- Clickable region cards with subscribe buttons
- Toggle buttons to filter places (Landmarks / Eateries / Transit)
- Dropdown menus for categories and regions
- Pill-shaped severity selectors (Low / Medium / High)
- Date pickers for itinerary planning
- One-tap actions like "Add to Itinerary" and "Remove"

The only things you actually have to type are the incident description and itinerary title.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Maps | Leaflet + react-leaflet |
| Backend | Express 5 + Node.js |
| Auth | express-session |
| Database | MySQL 8.4 + mysql2 |

**No ORM.** All database queries are raw SQL using prepared statements.

---

## Database Design

### Entity Count: 16 Tables

```
User, Admin, Region, Place, Landmark, Eatery, TransitStation,
TransitRoute, PublicTransit, Bus, Train, NewsPost, SafetyAlert,
IncidentReport, Itinerary, ItineraryItem
```

Plus 9 junction/relationship tables:

```
Subscribes_to, Views, Verifies, References, Services,
Serves, Stops_At, Arrival_times, Departure_times
```

### Weak Entities (2)

- **SafetyAlert** identified by `(NewsID, AlertNo)` through NewsPost
- **ItineraryItem** identified by `(ItineraryID, ItemNo)` through Itinerary

### Specializations

- **Place** specializes into Landmark, Eatery, and TransitStation (disjoint, partial)
- **PublicTransit** specializes into Bus and Train (disjoint, partial)

### Stored Procedures (9)

| Procedure | What It Does |
|-----------|-------------|
| `sp_register_user` | Creates a new user inside a transaction |
| `sp_get_places_by_region` | Filters places by type with conditional JOINs |
| `sp_create_itinerary_with_items` | Atomic multi-row insert from a JSON array |
| `sp_verify_incident` | Verifies a report and optionally auto-creates a news post |
| `sp_nearby_places` | Finds places within walking distance of a station |
| `sp_get_transit_schedule` | Returns 4 result sets across 6+ tables |
| `sp_get_user_feed` | Personalized news feed via subquery on subscriptions |
| `sp_get_popular_places` | Trending places ranked by itinerary reference count |
| `sp_get_region_summary` | Full region breakdown with counts by type |

---

## How It Meets the Project Requirements

| Requirement | Status | Details |
|-------------|--------|---------|
| 8+ unique entity types | **Met** | 16 entities |
| 1+ weak entity type | **Met** | SafetyAlert and ItineraryItem |
| 10+ relationship types | **Met** | 14 relationships |
| 2+ end-user types | **Met** | User and Admin with separate dashboards |
| Web-based mobile interface | **Met** | React SPA with responsive Tailwind CSS |
| Minimal keyboard input | **Met** | Dropdowns, toggles, date pickers, pill buttons |
| Stored procedures | **Met** | 9 stored procedures with transactions and error handling |
| Matches proposal | **Met** | All proposed features implemented |
| Complete DDL and DML | **Met** | Full schema.sql and seed.sql provided |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm

### 1. Set Up the Database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p UrbanScout < database/seed.sql
mysql -u root -p UrbanScout -e "source database/stored-procedures.sql"
```

### 2. Configure the Server

```bash
cd server
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=UrbanScout
PORT=3001
SESSION_SECRET=change-me-to-something-random
```

### 3. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Start the App

Open two terminals:

```bash
# Terminal 1 - Backend
cd server && npm start
```

```bash
# Terminal 2 - Frontend
cd client && npm run dev
```

The app will be running at **http://localhost:5173**

---

## Example Walkthrough

### As a User

**Login with:** `alice@example.com`

---

#### 1. Home Page

You see a hero image of Seoul and three region cards. Alice is already subscribed to Downtown Seoul and Hongdae.

| Button / Element | What It Does |
|-----------------|--------------|
| `Subscribe` button on a region card | Adds that region to your feed so you see its places, news, and alerts |
| `Subscribed` button (blue, filled) | Means you are already following this region. Click it again to unsubscribe |
| `Logout` (top right corner of hero) | Ends your session and takes you back to the login page |

---

#### 2. Places Tab

Browse all places across your subscribed regions.

| Button / Element | What It Does |
|-----------------|--------------|
| `Landmarks` / `Eateries` / `Transit` / `All` buttons | Filter the place cards by type. Only one filter is active at a time |
| `Filter by Region` dropdown | Narrows the list to places in a specific region |
| Clicking a place card | Opens the detail page for that place with a map, info, and nearby stations |

**On the Place Detail page:**

| Button / Element | What It Does |
|-----------------|--------------|
| `Back to Places` link (top left) | Goes back to the full places list |
| Map | Shows the exact location of the place using Leaflet |
| `Nearby Transit Stations` section | Lists transit stations within walking distance and how far they are in meters |
| `Add to Itinerary` dropdown + `Add` button | Pick one of your trip plans from the dropdown, then hit Add to include this place in that itinerary |
| "No itineraries yet" link | If you have not created any trips, this links you to the Trips tab to make one first |

---

#### 3. Transit Tab

See all 3 transit routes (Line 1, Line 2, Line 4).

| Button / Element | What It Does |
|-----------------|--------------|
| Route cards | Show the route name and service hours. These are display-only |
| `Select a station` dropdown | Pick a station to load its full schedule |
| Serving Routes badges (blue pills) | Show which transit lines stop at the selected station |
| Arrivals table | Lists all incoming transit vehicles with their route label, type, and arrival time |
| Departures table | Same thing but for departures |
| `Nearby Places` cards (below schedule) | Clickable cards showing landmarks and eateries within walking distance of the station. Click one to go to its detail page |

---

#### 4. News Tab

Read news posts for your subscribed regions.

| Button / Element | What It Does |
|-----------------|--------------|
| Region filter dropdown | Filters news to a specific region or shows all |
| Clicking a news card | Records that you viewed this post (tracked in the Views table) |
| Severity badge (green/yellow/red pill) | Shows how important the post is at a glance |
| Red safety alert box inside a card | Means this news post has an official safety alert attached with a specific affected area |

---

#### 5. Report Tab

Submit an incident report about something you saw.

| Button / Element | What It Does |
|-----------------|--------------|
| Region dropdown | Pick which region the incident happened in |
| Category dropdown | Choose from predefined types like Theft, Road Hazard, Crowd, Safety, Noise, Other |
| `Low` / `Medium` / `High` severity buttons | Tap one to set how serious the incident is. These are pill-shaped toggles, not a text field |
| Description textarea | The only field that requires typing. Describe what happened |
| `Submit Report` button | Sends the report to the database. An admin for that region will review it |
| Green success card | Appears after a successful submission. Does not auto-disappear |
| `Report Another` button | Clears the form so you can submit a new report |
| `View My Reports` link | Takes you to a page showing all your submitted reports and their verification status (Pending, Confirmed, or Rejected) |

---

#### 6. Trips Tab

Plan your itineraries and add places to visit.

| Button / Element | What It Does |
|-----------------|--------------|
| `+ New` button (top right) | Opens a form to create a new itinerary |
| Trip name input | Give your itinerary a name like "Seoul Weekend" |
| Date picker fields | Select start and end dates for your trip. Uses the native date picker so no typing needed |
| `Create` button | Saves the itinerary |
| Clicking an itinerary card | Opens the detail page showing all planned stops |
| `Delete` text button | Removes the entire itinerary and all its items |

**On the Itinerary Detail page:**

| Button / Element | What It Does |
|-----------------|--------------|
| `My Itineraries` back link | Goes back to the list of all your trips |
| Place name (blue link) | Clicking it opens the place detail page for that stop |
| `Edit` button on an item | Opens an inline form where you can change the notes and planned time |
| `Save` / `Cancel` buttons (in edit mode) | Save your changes or discard them |
| `Remove` button | Deletes that item from the itinerary |
| "Browse Places" link (empty state) | If the itinerary has no items, this links you to the Places tab to add some |

---

### As an Admin

**Login with:** `soyeon@urbanscout.io` (toggle to "Admin" on the login page first)

---

#### 1. Dashboard

See stats for your assigned region (Downtown Seoul).

| Button / Element | What It Does |
|-----------------|--------------|
| `Pending Reports` stat card | Clickable. Takes you to the Reports tab filtered to pending reports |
| `News Posts` stat card | Clickable. Takes you to the News management tab |
| `Places` and `Total Reports` stat cards | Display-only counters |
| `Logout` button (top right) | Ends your admin session |
| Recent pending reports preview | Shows the 3 most recent unreviewed reports for a quick look |

---

#### 2. Reports Tab

Review and verify incident reports submitted by users in your region.

| Button / Element | What It Does |
|-----------------|--------------|
| `All` / `Pending` / `Confirmed` / `Rejected` filter buttons | Filter the report list by verification status |
| `Confirm` button (green) | Marks the report as verified. This means an admin has confirmed the incident is real |
| `Reject` button (red) | Marks the report as rejected. The incident was not verified |
| Status badge on each report | Shows the current verification state (unreviewed, confirmed, or rejected) |

---

#### 3. News Tab

Create and view news posts for your assigned region.

| Button / Element | What It Does |
|-----------------|--------------|
| `+ New Post` button | Opens the news creation form |
| `Cancel` button | Closes the form without saving |
| Title input | Give the news post a headline |
| `Low` / `Medium` / `High` severity buttons | Set the importance level of the post |
| Body textarea | Write the content of the news post |
| `Include Safety Alert (optional)` checkbox | Toggles extra fields for attaching a safety alert |
| Alert type dropdown | Choose the type of alert (Road Closure, Crowd, Weather, Construction, Protest, Other) |
| Affected area input | Describe what area is affected |
| `Publish` button | Creates the news post and makes it visible to all users subscribed to your region |

### Sample Accounts

| Role | Email | Region |
|------|-------|--------|
| User | alice@example.com | Subscribed to Downtown Seoul, Hongdae |
| User | bob@example.com | Subscribed to Gangnam |
| User | charlie@example.com | Subscribed to all 3 regions |
| Admin | soyeon@urbanscout.io | Downtown Seoul |
| Admin | minho@urbanscout.io | Gangnam |
| Admin | jisoo@urbanscout.io | Hongdae |

---

## Project Structure

```
urban-scout/
    database/
        schema.sql            Full database DDL (25 tables)
        seed.sql              Sample data for all tables
        stored-procedures.sql 9 stored procedures
        drop.sql              Clean teardown script
    server/
        index.js              Express entry point
        db.js                 MySQL connection pool
        middleware/auth.js    Session-based auth guards
        routes/               8 route files (auth, regions, places,
                              transit, news, incidents, itineraries,
                              subscriptions)
    client/
        src/
            App.jsx           Router with 14 routes
            context/          Auth context provider
            pages/            13 page components
            components/       Shared UI components (Navbar,
                              PlaceCard, MapView, etc.)
    docs/                     All project documentation (proposal,
                              progress reports, ERD, UML,
                              presentations, evaluation form)
```

---

## Database Reset

If you need to start fresh:

```bash
mysql -u root -p UrbanScout < database/drop.sql
mysql -u root -p < database/schema.sql
mysql -u root -p UrbanScout < database/seed.sql
mysql -u root -p UrbanScout -e "source database/stored-procedures.sql"
```

---

## Documentation

All project documentation is in the `docs/` folder:

- `Project Proposal Gr 61.pdf` - Original project proposal
- `Progress Report 1.pdf` through `Progress Report 3.pdf` - Intermediate submissions
- `ERD Diagram.drawio.png` - Entity-Relationship Diagram
- `UML_1.drawio.png` - UML Class Diagram
- `Presentation_Gr61_CPSC471.pdf` - Project presentation
- `Project Specification CPSC 471-.pdf` - Assignment specification
- `cpsc471-project-eval.pdf` - Evaluation rubric

---

*CPSC 471 - University of Calgary - Winter 2026*

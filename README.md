# Urban Scout

Tourist web app for Seoul - find places, check transit, read news, report incidents, and plan trips. All in one spot.

CPSC 471 - University of Calgary - Winter 2026 - Group 61

---

## Table of Contents

- [Team](#team)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)

---

## Team

| Name | Role |
|:-----|:-----|
| Sean Kim | Developer |
| Muhtasim Ishmam | Developer |
| Talha Hussain Mahr | Developer |

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Maps | Leaflet + react-leaflet |
| Backend | Express 5 + Node.js |
| Auth | express-session |
| Database | MySQL 8.4 + mysql2 (raw SQL, no ORM) |

For setup instructions, sample accounts, and how to use the app, see the [User Manual](User%20Manual.pdf).

---

## Project Structure

```
urban-scout/
    database/
        schema.sql            DDL for all tables
        seed.sql              Sample data
        stored-procedures.sql 9 stored procedures
        drop.sql              Teardown script
    server/
        index.js              Express entry point
        db.js                 MySQL connection pool
        middleware/auth.js    Session auth
        routes/               Route files (auth, regions, places,
                              transit, news, incidents, itineraries,
                              subscriptions)
    client/
        src/
            App.jsx           Router
            context/          Auth context
            pages/            Page components
            components/       Shared UI (Navbar, PlaceCard, MapView, etc.)
    docs/                     Project docs (proposal, reports,
                              presentations, diagrams, final report)
```



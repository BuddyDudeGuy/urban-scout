# Urban Scout

Tourist web app for Seoul - find places, check transit, read news, report incidents, and plan trips. All in one spot.

CPSC 471 - University of Calgary - Winter 2026 - Group 61

---

## Table of Contents

- [Team](#team)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Sample Accounts](#sample-accounts)
- [Project Structure](#project-structure)
- [Database Reset](#database-reset)
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

```bash
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - Frontend
cd client && npm run dev
```

App runs at **http://localhost:5173**

---

## Sample Accounts

No passwords - just enter the email on the login page.

| Role | Email |
|:-----|:------|
| User | `alice@example.com` |
| User | `bob@example.com` |
| User | `charlie@example.com` |
| Admin | `soyeon@urbanscout.io` |
| Admin | `minho@urbanscout.io` |
| Admin | `jisoo@urbanscout.io` |

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

---

## Database Reset

```bash
mysql -u root -p UrbanScout < database/drop.sql
mysql -u root -p < database/schema.sql
mysql -u root -p UrbanScout < database/seed.sql
mysql -u root -p UrbanScout -e "source database/stored-procedures.sql"
```


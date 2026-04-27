# V3: Endpoint to SQL mapping

Every endpoint across the 8 route files. Total 36 endpoints. Use these blocks verbatim in section 3.5.

## /api/auth

### POST /api/auth/register
**Auth:** none
**Purpose:** Create a new user account and save to session.
```sql
INSERT INTO User (name, email, home_city) VALUES (?, ?, ?);
```

### POST /api/auth/login
**Auth:** none
**Purpose:** Look up user by email and establish session.
```sql
SELECT * FROM User WHERE email = ?;
```

### POST /api/auth/admin-login
**Auth:** none
**Purpose:** Look up admin by email and establish admin session.
```sql
SELECT * FROM Admin WHERE email = ?;
```

### POST /api/auth/logout
**Auth:** none
**Purpose:** Destroy session.
(no SQL, session destruction only)

### GET /api/auth/me
**Auth:** none
**Purpose:** Return current logged-in user or admin, or null.
(no SQL, session inspection only)

## /api/regions

### GET /api/regions
**Auth:** none
**Purpose:** Retrieve all regions for the home page.
```sql
SELECT * FROM Region;
```

### GET /api/regions/:id
**Auth:** none
**Purpose:** Retrieve a single region with place and news post counts.
```sql
SELECT * FROM Region WHERE RegionID = ?;
SELECT COUNT(*) as count FROM Place WHERE RegionID = ?;
SELECT COUNT(*) as count FROM NewsPost WHERE RegionID = ?;
```

## /api/places

### GET /api/places
**Auth:** none
**Purpose:** Retrieve all places, optionally filtered by region and type.
```sql
-- when type=landmark
SELECT p.*, l.landmark_type, l.hours
FROM Place p JOIN Landmark l ON p.PlaceID = l.LandmarkID
WHERE 1=1 ORDER BY p.name;

-- when type=eatery
SELECT p.*, e.avg_cost_per_person
FROM Place p JOIN Eatery e ON p.PlaceID = e.EateryID
WHERE 1=1 ORDER BY p.name;

-- when type=transit
SELECT p.*, ts.station_code
FROM Place p JOIN TransitStation ts ON p.PlaceID = ts.StationID
WHERE 1=1 ORDER BY p.name;

-- when no type filter
SELECT p.*,
  CASE
    WHEN l.LandmarkID IS NOT NULL THEN 'landmark'
    WHEN e.EateryID IS NOT NULL THEN 'eatery'
    WHEN ts.StationID IS NOT NULL THEN 'transit'
    ELSE 'other'
  END AS placeType,
  l.landmark_type, l.hours,
  e.avg_cost_per_person,
  ts.station_code
FROM Place p
LEFT JOIN Landmark l ON p.PlaceID = l.LandmarkID
LEFT JOIN Eatery e ON p.PlaceID = e.EateryID
LEFT JOIN TransitStation ts ON p.PlaceID = ts.StationID
WHERE 1=1 ORDER BY p.name;

-- regionId filter appended:
-- AND p.RegionID = ?
```

### GET /api/places/:id
**Auth:** none
**Purpose:** Retrieve a single place with details and nearby transit stations.
```sql
SELECT p.*,
  l.landmark_type, l.hours,
  e.avg_cost_per_person,
  ts.station_code,
  CASE
    WHEN l.LandmarkID IS NOT NULL THEN 'landmark'
    WHEN e.EateryID IS NOT NULL THEN 'eatery'
    WHEN ts.StationID IS NOT NULL THEN 'transit'
    ELSE 'other'
  END AS placeType
FROM Place p
LEFT JOIN Landmark l ON p.PlaceID = l.LandmarkID
LEFT JOIN Eatery e ON p.PlaceID = e.EateryID
LEFT JOIN TransitStation ts ON p.PlaceID = ts.StationID
WHERE p.PlaceID = ?;

SELECT s.distance_m, p.name AS station_name, ts.station_code, p.PlaceID AS StationPlaceID
FROM Services s
JOIN Place p ON s.StationID = p.PlaceID
JOIN TransitStation ts ON s.StationID = ts.StationID
WHERE s.PlaceID = ?
ORDER BY s.distance_m ASC;
```

### POST /api/places
**Auth:** admin
**Purpose:** Create a place plus its specialization row in one transaction.
```sql
START TRANSACTION;

INSERT INTO Place (name, address, coordinates, RegionID)
VALUES (?, ?, ?, ?);

-- one of the following depending on type
INSERT INTO Landmark (LandmarkID, landmark_type, hours) VALUES (?, ?, ?);
INSERT INTO Eatery (EateryID, avg_cost_per_person) VALUES (?, ?);
INSERT INTO TransitStation (StationID, station_code) VALUES (?, ?);

COMMIT;
```

## /api/transit

### GET /api/transit/routes
**Auth:** none
**Purpose:** Retrieve all transit routes.
```sql
SELECT * FROM TransitRoute;
```

### POST /api/transit/routes
**Auth:** admin
**Purpose:** Add a new transit route.
```sql
INSERT INTO TransitRoute (route_name, service_hours) VALUES (?, ?);
```

### DELETE /api/transit/routes/:id
**Auth:** admin
**Purpose:** Delete a transit route, cascades to Serves.
```sql
DELETE FROM TransitRoute WHERE RouteID = ?;
```

### POST /api/transit/routes/:id/stations
**Auth:** admin
**Purpose:** Link a station and a transit vehicle to a route as a stop.
```sql
INSERT INTO Serves (RouteID, StationID, TransitID) VALUES (?, ?, ?);
```

### DELETE /api/transit/routes/:id/stations
**Auth:** admin
**Purpose:** Remove a stop from a route.
```sql
DELETE FROM Serves WHERE RouteID = ? AND StationID = ? AND TransitID = ?;
```

### GET /api/transit/routes/:id/stations
**Auth:** none
**Purpose:** List the stops on a single route.
```sql
SELECT sv.StationID, sv.TransitID,
       p.name AS station_name, ts.station_code,
       pt.route_label, pt.vehicle_type
FROM Serves sv
JOIN TransitStation ts ON sv.StationID = ts.StationID
JOIN Place p ON ts.StationID = p.PlaceID
JOIN PublicTransit pt ON sv.TransitID = pt.TransitID
WHERE sv.RouteID = ?
ORDER BY p.name;
```

### GET /api/transit/vehicles
**Auth:** none
**Purpose:** List transit vehicles, optional ?type filter.
```sql
SELECT * FROM PublicTransit;
-- with type filter:
SELECT * FROM PublicTransit WHERE vehicle_type = ?;
```

### GET /api/transit/stations/:id/schedule
**Auth:** none
**Purpose:** Return four result sets that make up a station's schedule view.
```sql
SELECT p.name, p.address, p.coordinates, ts.station_code
FROM Place p JOIN TransitStation ts ON p.PlaceID = ts.StationID
WHERE ts.StationID = ?;

SELECT at.arrival_time, pt.route_label, pt.vehicle_type, pt.TransitID
FROM Arrival_times at JOIN PublicTransit pt ON at.TransitID = pt.TransitID
WHERE at.StationID = ?
ORDER BY at.arrival_time;

SELECT dt.departure_time, pt.route_label, pt.vehicle_type, pt.TransitID
FROM Departure_times dt JOIN PublicTransit pt ON dt.TransitID = pt.TransitID
WHERE dt.StationID = ?
ORDER BY dt.departure_time;

SELECT DISTINCT tr.RouteID, tr.route_name, tr.service_hours
FROM Serves sv JOIN TransitRoute tr ON sv.RouteID = tr.RouteID
WHERE sv.StationID = ?;
```

### GET /api/transit/stations/:id/nearby
**Auth:** none
**Purpose:** Find places within walking distance using a stored procedure.
```sql
CALL sp_nearby_places(?, ?);
```

## /api/news

### GET /api/news
**Auth:** none for public, but uses session if a user is logged in (filters by subscriptions when no regionId supplied).
**Purpose:** Retrieve news posts with embedded safety alerts. Three branches: regionId given, user logged in with no regionId, or anonymous browse.
```sql
-- anonymous, all news
SELECT np.*, r.name AS region_name, a.name AS admin_name,
  sa.AlertNo, sa.alert_type, sa.area_text, sa.severity_override
FROM NewsPost np
JOIN Region r ON np.RegionID = r.RegionID
JOIN Admin a ON np.AdminID = a.AdminID
LEFT JOIN SafetyAlert sa ON np.NewsID = sa.NewsID
ORDER BY np.time_stamp DESC;

-- with regionId
... WHERE np.RegionID = ? ORDER BY np.time_stamp DESC;

-- logged-in user, no regionId, default to subscribed regions
... WHERE np.RegionID IN (
  SELECT RegionID FROM Subscribes_to WHERE UserID = ?
) ORDER BY np.time_stamp DESC;
```

### GET /api/news/:id
**Auth:** none
**Purpose:** Retrieve a single news post and its safety alerts.
```sql
SELECT np.*, r.name AS region_name, a.name AS admin_name
FROM NewsPost np
JOIN Region r ON np.RegionID = r.RegionID
JOIN Admin a ON np.AdminID = a.AdminID
WHERE np.NewsID = ?;

SELECT * FROM SafetyAlert WHERE NewsID = ?;
```

### POST /api/news
**Auth:** admin
**Purpose:** Create a news post, optionally with one safety alert.
```sql
INSERT INTO NewsPost (title, severity, body_text, RegionID, AdminID) VALUES (?, ?, ?, ?, ?);
INSERT INTO SafetyAlert (NewsID, AlertNo, alert_type, area_text, severity_override) VALUES (?, 1, ?, ?, ?);
```

### POST /api/news/:id/view
**Auth:** user
**Purpose:** Record that a user viewed a news post.
```sql
INSERT IGNORE INTO Views (UserID, NewsID) VALUES (?, ?);
```

## /api/incidents

### GET /api/incidents/mine
**Auth:** user
**Purpose:** List the logged-in user's reports with verification status.
```sql
SELECT ir.*, r.name AS region_name,
  v.Status AS verification_status, a.name AS verifier_name
FROM IncidentReport ir
JOIN Region r ON ir.RegionID = r.RegionID
LEFT JOIN Verifies v ON ir.Report_ID = v.ReportID
LEFT JOIN Admin a ON v.AdminID = a.AdminID
WHERE ir.UserID = ?
ORDER BY ir.timestamp DESC;
```

### GET /api/incidents
**Auth:** none (admin uses regionId filter)
**Purpose:** List reports, optionally filtered by region.
```sql
SELECT ir.*, u.name AS reporter_name,
  v.AdminID AS verifier_id, v.Status AS verification_status,
  a.name AS verifier_name
FROM IncidentReport ir
JOIN User u ON ir.UserID = u.UserID
LEFT JOIN Verifies v ON ir.Report_ID = v.ReportID
LEFT JOIN Admin a ON v.AdminID = a.AdminID
ORDER BY ir.timestamp DESC;

-- with regionId filter:
... WHERE ir.RegionID = ? ORDER BY ir.timestamp DESC;
```

### POST /api/incidents
**Auth:** user
**Purpose:** Submit a new incident report.
```sql
INSERT INTO IncidentReport (category, description, severity, coordinates, UserID, RegionID) VALUES (?, ?, ?, ?, ?, ?);
```

### PUT /api/incidents/:reportId/verify
**Auth:** admin
**Purpose:** Verify or reject a report.
```sql
REPLACE INTO Verifies (AdminID, ReportID, Status) VALUES (?, ?, ?);
```

## /api/itineraries

### GET /api/itineraries
**Auth:** user
**Purpose:** List the user's itineraries.
```sql
SELECT * FROM Itinerary WHERE UserID = ? ORDER BY start_date DESC;
```

### GET /api/itineraries/:id
**Auth:** user
**Purpose:** Get one itinerary plus its items and referenced places.
```sql
SELECT * FROM Itinerary WHERE ItineraryID = ? AND UserID = ?;

SELECT ii.ItemNo, ii.planned_time, ii.notes,
  p.PlaceID, p.name AS place_name, p.address, p.coordinates
FROM ItineraryItem ii
LEFT JOIN `References` r ON ii.ItineraryID = r.ItineraryID AND ii.ItemNo = r.ItemNo
LEFT JOIN Place p ON r.PlaceID = p.PlaceID
WHERE ii.ItineraryID = ?
ORDER BY ii.planned_time;
```

### POST /api/itineraries
**Auth:** user
**Purpose:** Create a new itinerary.
```sql
INSERT INTO Itinerary (title, start_date, end_date, UserID) VALUES (?, ?, ?, ?);
```

### DELETE /api/itineraries/:id
**Auth:** user
**Purpose:** Delete an itinerary, cascades to its items and references.
```sql
DELETE FROM Itinerary WHERE ItineraryID = ? AND UserID = ?;
```

### POST /api/itineraries/:id/items
**Auth:** user
**Purpose:** Add an item to an itinerary, optionally linking it to a place.
```sql
SELECT ItineraryID FROM Itinerary WHERE ItineraryID = ? AND UserID = ?;
SELECT COALESCE(MAX(ItemNo), 0) + 1 AS nextNo FROM ItineraryItem WHERE ItineraryID = ?;
INSERT INTO ItineraryItem (ItineraryID, ItemNo, planned_time, notes) VALUES (?, ?, ?, ?);
INSERT INTO `References` (PlaceID, ItineraryID, ItemNo) VALUES (?, ?, ?);
```

### PUT /api/itineraries/:id/items/:itemNo
**Auth:** user
**Purpose:** Update item notes or planned time.
```sql
UPDATE ItineraryItem SET planned_time = ?, notes = ? WHERE ItineraryID = ? AND ItemNo = ?;
```

### DELETE /api/itineraries/:id/items/:itemNo
**Auth:** user
**Purpose:** Remove an item, cascades to References.
```sql
DELETE FROM ItineraryItem WHERE ItineraryID = ? AND ItemNo = ?;
```

## /api/subscriptions

### GET /api/subscriptions
**Auth:** user
**Purpose:** List the regions the user is subscribed to.
```sql
SELECT r.*
FROM Subscribes_to st
JOIN Region r ON st.RegionID = r.RegionID
WHERE st.UserID = ?;
```

### POST /api/subscriptions
**Auth:** user
**Purpose:** Subscribe to a region (no-op if already subscribed).
```sql
INSERT IGNORE INTO Subscribes_to (UserID, RegionID) VALUES (?, ?);
```

### DELETE /api/subscriptions/:regionId
**Auth:** user
**Purpose:** Unsubscribe from a region.
```sql
DELETE FROM Subscribes_to WHERE UserID = ? AND RegionID = ?;
```

## Summary table (for quick scan)

| Method | Path | Auth |
|--------|------|------|
| POST | /api/auth/register | none |
| POST | /api/auth/login | none |
| POST | /api/auth/admin-login | none |
| POST | /api/auth/logout | none |
| GET | /api/auth/me | none |
| GET | /api/regions | none |
| GET | /api/regions/:id | none |
| GET | /api/places | none |
| GET | /api/places/:id | none |
| POST | /api/places | admin |
| GET | /api/transit/routes | none |
| POST | /api/transit/routes | admin |
| DELETE | /api/transit/routes/:id | admin |
| POST | /api/transit/routes/:id/stations | admin |
| DELETE | /api/transit/routes/:id/stations | admin |
| GET | /api/transit/routes/:id/stations | none |
| GET | /api/transit/vehicles | none |
| GET | /api/transit/stations/:id/schedule | none |
| GET | /api/transit/stations/:id/nearby | none |
| GET | /api/news | none |
| GET | /api/news/:id | none |
| POST | /api/news | admin |
| POST | /api/news/:id/view | user |
| GET | /api/incidents/mine | user |
| GET | /api/incidents | none |
| POST | /api/incidents | user |
| PUT | /api/incidents/:reportId/verify | admin |
| GET | /api/itineraries | user |
| GET | /api/itineraries/:id | user |
| POST | /api/itineraries | user |
| DELETE | /api/itineraries/:id | user |
| POST | /api/itineraries/:id/items | user |
| PUT | /api/itineraries/:id/items/:itemNo | user |
| DELETE | /api/itineraries/:id/items/:itemNo | user |
| GET | /api/subscriptions | user |
| POST | /api/subscriptions | user |
| DELETE | /api/subscriptions/:regionId | user |

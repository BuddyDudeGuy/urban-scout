# V2: Stored Procedure Audit Output

Nine procedures total. Only `sp_nearby_places` is currently called from the API (server/routes/transit.js GET /api/transit/stations/:id/nearby). The other eight are designed and ready in the database layer.

## sp_register_user
**Signature:** IN p_name VARCHAR(100), IN p_email VARCHAR(150), IN p_home_city VARCHAR(100)
**Called from API:** no, defined for completeness
**Transactions:** START TRANSACTION / COMMIT
**Error handling:** none explicit
**Result sets:** 1 (the new User row)
**What it does:** Inserts a new user into the User table inside a transaction, then returns the freshly created row using LAST_INSERT_ID(). Lets the API caller hand the new user details straight to the session without a follow-up query.
**SQL summary:** Wraps an INSERT in a transaction and ends with a SELECT on the new UserID.

## sp_get_places_by_region
**Signature:** IN p_region_id INT, IN p_place_type VARCHAR(20)
**Called from API:** no
**Transactions:** none
**Error handling:** none
**Result sets:** 1
**What it does:** Returns all places in a region, optionally filtered to landmarks, eateries, or transit stations. When no type is given, the result includes a CASE-derived placeType column so the caller knows what each row represents.
**SQL summary:** IF / ELSEIF branches by p_place_type. Specific types JOIN their subclass table. Empty type LEFT JOINs all three.

## sp_create_itinerary_with_items
**Signature:** IN p_user_id INT, IN p_title VARCHAR(150), IN p_start_date DATE, IN p_end_date DATE, IN p_items JSON
**Called from API:** no
**Transactions:** START TRANSACTION / COMMIT / ROLLBACK
**Error handling:** DECLARE EXIT HANDLER FOR SQLEXCEPTION
**Result sets:** 1 (the new Itinerary row)
**What it does:** Creates an itinerary header plus all of its items in a single atomic operation. Accepts a JSON array of items, each with a planned_time, notes, and optional placeId. If a placeId is present the procedure also writes a row in References to link the item to a place.
**SQL summary:** INSERT into Itinerary, loop the JSON with JSON_EXTRACT and JSON_LENGTH, INSERT each ItineraryItem, conditionally INSERT into References. The handler rolls back if anything fails.

## sp_verify_incident
**Signature:** IN p_admin_id INT, IN p_report_id INT, IN p_status VARCHAR(30), IN p_create_news BOOLEAN
**Called from API:** no
**Transactions:** START TRANSACTION / COMMIT / ROLLBACK
**Error handling:** DECLARE EXIT HANDLER FOR SQLEXCEPTION
**Result sets:** 1 (status message)
**What it does:** Lets an admin confirm or reject an incident report. If the status is confirmed and the admin opts in, the procedure auto-publishes a NewsPost using the incident's category, description, severity, and region so that subscribers see the alert without an extra API call.
**SQL summary:** REPLACE INTO Verifies handles upsert. A guarded INSERT into NewsPost runs when p_status equals 'confirmed' and p_create_news is TRUE.

## sp_nearby_places
**Signature:** IN p_station_id INT, IN p_max_distance DECIMAL(8,1)
**Called from API:** YES, at server/routes/transit.js GET /api/transit/stations/:id/nearby
**Transactions:** none needed (read-only)
**Error handling:** none
**Result sets:** 1
**What it does:** Returns every place within a walking-distance threshold of a given transit station. Uses the precomputed distances in the Services table so the lookup is a quick filtered JOIN, not a runtime distance calculation. Each row includes the place type so the client knows whether it is a landmark, eatery, or another station.
**SQL summary:** JOIN Services to Place, LEFT JOIN the three specialization tables, filter by StationID and distance_m, ORDER BY distance ascending.

## sp_get_transit_schedule
**Signature:** IN p_station_id INT
**Called from API:** no
**Transactions:** none
**Error handling:** none
**Result sets:** 4 (station info, serving routes, arrivals, departures)
**What it does:** Returns the full schedule view for one station as four sequential result sets. Demonstrates how a stored procedure can package multiple related queries that the application would otherwise have to issue separately.
**SQL summary:** Four SELECTs in a row. JOINs across Place, TransitStation, Serves, TransitRoute, Arrival_times, Departure_times, and PublicTransit.

## sp_get_user_feed
**Signature:** IN p_user_id INT
**Called from API:** no
**Transactions:** none
**Error handling:** none
**Result sets:** 1
**What it does:** Builds a personalized news feed for a user by pulling every NewsPost from the regions they subscribed to. Safety alerts attached to each post come along through a LEFT JOIN so the client can render them inline. Posts are returned in reverse chronological order.
**SQL summary:** Subquery on Subscribes_to to find the user's regions. JOIN NewsPost with Region and Admin, LEFT JOIN SafetyAlert, ORDER BY time_stamp DESC.

## sp_get_popular_places
**Signature:** IN p_limit INT
**Called from API:** no
**Transactions:** none
**Error handling:** none
**Result sets:** 1
**What it does:** Ranks places by how many times they appear in user itineraries through the References table, returning the top N. Useful for "trending" or "recommended" lists across the app.
**SQL summary:** JOIN Place with Region, LEFT JOIN References and the three specialization tables. GROUP BY Place, COUNT references, ORDER DESC, LIMIT p_limit.

## sp_get_region_summary
**Signature:** IN p_region_id INT
**Called from API:** no
**Transactions:** none
**Error handling:** none
**Result sets:** 3 (region info, place counts by type, content stats)
**What it does:** Builds an admin dashboard view for a single region. The first set is the region row, the second breaks down place counts by subclass (landmarks, eateries, stations), and the third counts news posts, incident reports, and subscribers.
**SQL summary:** Three SELECTs. The middle one uses SUM(CASE WHEN ... THEN 1 ELSE 0 END) tricks for per-type counts.

## Summary paragraph for the report

Nine stored procedures are defined in the Urban Scout database. They cover registration, place lookup with optional type filtering, atomic itinerary creation from a JSON payload, admin verification of incident reports with optional auto-news, walking-distance search for nearby places, multi-result-set transit schedules, personalized news feeds, popularity ranking, and region summaries. Currently the API wires up `sp_nearby_places` (used by the transit station "nearby places" view, which is the showcase query the demo highlighted). The other eight are present in the database layer because the rubric for the demo evaluates the design and structure of stored procedures, and they serve as a complete library that could be wired to the API as features grow.

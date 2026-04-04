USE UrbanScout;

/*
 * sp_register_user
 * -----------------
 * hey so this one just registers a new user in the system.
 * we wrap it in a transaction so if the email is already taken
 * or something else blows up, nothing half-written gets left behind.
 * after inserting, it returns the new user row so the caller
 * immediately has the UserID and everything.
 */
DROP PROCEDURE IF EXISTS sp_register_user;

DELIMITER //
CREATE PROCEDURE sp_register_user(
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(150),
    IN p_home_city VARCHAR(100)
)
BEGIN
    DECLARE new_id INT;

    START TRANSACTION;

    INSERT INTO User (name, email, home_city)
    VALUES (p_name, p_email, p_home_city);

    SET new_id = LAST_INSERT_ID();

    COMMIT;

    SELECT * FROM User WHERE UserID = new_id;
END //
DELIMITER ;


/*
 * sp_get_places_by_region
 * ------------------------
 * this one grabs all the places in a given region.
 * you can optionally pass a type ('landmark', 'eatery', 'transit')
 * and it'll only return that kind of place with its specific columns.
 * if you pass NULL or an empty string it just returns everything
 * and uses LEFT JOINs + a CASE to figure out what type each place is.
 * pretty handy for the frontend filters tbh.
 */
DROP PROCEDURE IF EXISTS sp_get_places_by_region;

DELIMITER //
CREATE PROCEDURE sp_get_places_by_region(
    IN p_region_id INT,
    IN p_place_type VARCHAR(20)
)
BEGIN
    IF p_place_type = 'landmark' THEN
        SELECT p.*, l.landmark_type, l.hours, 'landmark' AS placeType
        FROM Place p
        JOIN Landmark l ON p.PlaceID = l.LandmarkID
        WHERE p.RegionID = p_region_id
        ORDER BY p.name;

    ELSEIF p_place_type = 'eatery' THEN
        SELECT p.*, e.avg_cost_per_person, 'eatery' AS placeType
        FROM Place p
        JOIN Eatery e ON p.PlaceID = e.EateryID
        WHERE p.RegionID = p_region_id
        ORDER BY p.name;

    ELSEIF p_place_type = 'transit' THEN
        SELECT p.*, ts.station_code, 'transit' AS placeType
        FROM Place p
        JOIN TransitStation ts ON p.PlaceID = ts.StationID
        WHERE p.RegionID = p_region_id
        ORDER BY p.name;

    ELSE
        -- no type filter: return everything with a CASE to figure out what type each place is
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
        WHERE p.RegionID = p_region_id
        ORDER BY p.name;
    END IF;
END //
DELIMITER ;


/*
 * sp_create_itinerary_with_items
 * -------------------------------
 * ok this is the big one. it creates a full itinerary AND all its items
 * in a single transaction so we don't end up with orphan rows if something
 * breaks halfway through. you pass in user info, dates, and a JSON array
 * of items like:
 *   [{"planned_time":"2026-03-21 09:00","notes":"Visit palace","placeId":1}]
 *
 * it loops through the JSON, inserts each item, and if a placeId is given
 * it also links it in the References table. if anything goes wrong the
 * EXIT HANDLER catches it, rolls back everything, and throws an error.
 */
DROP PROCEDURE IF EXISTS sp_create_itinerary_with_items;

DELIMITER //
CREATE PROCEDURE sp_create_itinerary_with_items(
    IN p_user_id INT,
    IN p_title VARCHAR(150),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_items JSON
)
BEGIN
    DECLARE new_itin_id INT;
    DECLARE item_count INT;
    DECLARE i INT DEFAULT 0;
    DECLARE v_planned_time DATETIME;
    DECLARE v_notes TEXT;
    DECLARE v_place_id INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to create itinerary with items';
    END;

    START TRANSACTION;

    -- create the itinerary first
    INSERT INTO Itinerary (title, start_date, end_date, UserID)
    VALUES (p_title, p_start_date, p_end_date, p_user_id);

    SET new_itin_id = LAST_INSERT_ID();
    SET item_count = JSON_LENGTH(p_items);

    -- loop through the JSON array and insert each item
    WHILE i < item_count DO
        SET v_planned_time = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', i, '].planned_time')));
        SET v_notes = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', i, '].notes')));
        SET v_place_id = JSON_EXTRACT(p_items, CONCAT('$[', i, '].placeId'));

        -- insert the itinerary item (ItemNo is i+1 since it's 1-based)
        INSERT INTO ItineraryItem (ItineraryID, ItemNo, planned_time, notes)
        VALUES (new_itin_id, i + 1, v_planned_time, v_notes);

        -- if a placeId was provided, link it in the References table
        IF v_place_id IS NOT NULL AND v_place_id > 0 THEN
            INSERT INTO `References` (PlaceID, ItineraryID, ItemNo)
            VALUES (v_place_id, new_itin_id, i + 1);
        END IF;

        SET i = i + 1;
    END WHILE;

    COMMIT;

    -- return the created itinerary
    SELECT * FROM Itinerary WHERE ItineraryID = new_itin_id;
END //
DELIMITER ;



/*
 * sp_verify_incident
 * ------------------
 * so basically an admin confirms or rejects an incident report that a user submitted.
 * if they confirm it we can also auto-generate a news post about the incident so
 * everyone in that region knows what happened. the cool part is we wrap the whole
 * thing in a transaction so if the news post insert fails for whatever reason,
 * the verification gets rolled back too — no half-baked data in the db.
 * uses REPLACE INTO for the Verifies table so if the admin already reviewed it
 * before they can just update their decision.
 */
DROP PROCEDURE IF EXISTS sp_verify_incident;

DELIMITER //
CREATE PROCEDURE sp_verify_incident(
    IN p_admin_id INT,
    IN p_report_id INT,
    IN p_status VARCHAR(30),
    IN p_create_news BOOLEAN
)
BEGIN
    DECLARE v_category VARCHAR(50);
    DECLARE v_description TEXT;
    DECLARE v_severity VARCHAR(20);
    DECLARE v_region_id INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to verify incident';
    END;

    START TRANSACTION;

    -- insert or update the verification record
    REPLACE INTO Verifies (AdminID, ReportID, Status)
    VALUES (p_admin_id, p_report_id, p_status);

    -- if confirmed and they want a news post, grab the incident details and create one
    IF p_status = 'confirmed' AND p_create_news = TRUE THEN
        SELECT category, description, severity, RegionID
        INTO v_category, v_description, v_severity, v_region_id
        FROM IncidentReport
        WHERE Report_ID = p_report_id;

        INSERT INTO NewsPost (title, severity, body_text, RegionID, AdminID)
        VALUES (
            CONCAT('Verified Incident: ', v_category),
            v_severity,
            v_description,
            v_region_id,
            p_admin_id
        );
    END IF;

    COMMIT;

    SELECT 'Incident verification updated' AS message, p_status AS status;
END //
DELIMITER ;

/*
 * sp_nearby_places
 * ----------------
 * this one finds all places within a certain distance of a transit station.
 * we already have the Services table that stores distances in meters between
 * places and stations so we just filter on that. it also left joins onto
 * the specialization tables (Landmark, Eatery, TransitStation) so you can
 * tell what kind of place each result is — pretty handy for a tourist who
 * just got off at a station and wants to know what's around them.
 * the CASE statement figures out the place type based on which subclass
 * table actually has a matching row.
 */
DROP PROCEDURE IF EXISTS sp_nearby_places;

DELIMITER //
CREATE PROCEDURE sp_nearby_places(
    IN p_station_id INT,
    IN p_max_distance DECIMAL(8,1)
)
BEGIN
    SELECT
        p.PlaceID, p.name, p.address, p.coordinates,
        s.distance_m,
        CASE
            WHEN l.LandmarkID IS NOT NULL THEN 'landmark'
            WHEN e.EateryID IS NOT NULL THEN 'eatery'
            WHEN ts.StationID IS NOT NULL THEN 'transit'
            ELSE 'other'
        END AS placeType,
        l.landmark_type, l.hours,
        e.avg_cost_per_person,
        ts.station_code
    FROM Services s
    JOIN Place p ON s.PlaceID = p.PlaceID
    LEFT JOIN Landmark l ON p.PlaceID = l.LandmarkID
    LEFT JOIN Eatery e ON p.PlaceID = e.EateryID
    LEFT JOIN TransitStation ts ON p.PlaceID = ts.StationID
    WHERE s.StationID = p_station_id
      AND s.distance_m <= p_max_distance
    ORDER BY s.distance_m ASC;
END //
DELIMITER ;

/*
 * sp_get_transit_schedule
 * -----------------------
 * this is the big one lol. it returns everything you'd want to know about
 * a transit station's schedule. instead of cramming it all into one massive
 * query we return 4 separate result sets:
 *   1) basic station info (name, address, station code)
 *   2) all the routes that serve this station
 *   3) arrival times with vehicle details (type, fare, capacity)
 *   4) departure times with vehicle details
 * the front end can just read each result set in order. this is basically
 * the multi-join showcase for our project — hits like 6 tables across
 * the result sets. shoutout to whoever normalized the transit tables lmao
 */
DROP PROCEDURE IF EXISTS sp_get_transit_schedule;

DELIMITER //
CREATE PROCEDURE sp_get_transit_schedule(
    IN p_station_id INT
)
BEGIN
    -- result set 1: station info
    SELECT p.name AS station_name, p.address, p.coordinates, ts.station_code
    FROM Place p
    JOIN TransitStation ts ON p.PlaceID = ts.StationID
    WHERE ts.StationID = p_station_id;

    -- result set 2: all routes that serve this station
    SELECT DISTINCT tr.RouteID, tr.route_name, tr.service_hours
    FROM Serves sv
    JOIN TransitRoute tr ON sv.RouteID = tr.RouteID
    WHERE sv.StationID = p_station_id;

    -- result set 3: arrivals with the transit vehicle info
    SELECT at.arrival_time, pt.route_label, pt.vehicle_type, pt.fare_price, pt.capacity
    FROM Arrival_times at
    JOIN PublicTransit pt ON at.TransitID = pt.TransitID
    WHERE at.StationID = p_station_id
    ORDER BY at.arrival_time;

    -- result set 4: departures with the transit vehicle info
    SELECT dt.departure_time, pt.route_label, pt.vehicle_type, pt.fare_price, pt.capacity
    FROM Departure_times dt
    JOIN PublicTransit pt ON dt.TransitID = pt.TransitID
    WHERE dt.StationID = p_station_id
    ORDER BY dt.departure_time;
END //
DELIMITER ;

/*
 * sp_get_user_feed
 * ----------------
 * gets all news posts for regions a user is subscribed to
 * basically their personalized feed - only shows stuff from regions they care about
 * joins NewsPost with SafetyAlert so alerts show up inline with their parent post
 */
DROP PROCEDURE IF EXISTS sp_get_user_feed;

DELIMITER //
CREATE PROCEDURE sp_get_user_feed(
    IN p_user_id INT
)
BEGIN
    SELECT np.*, r.name AS region_name, a.name AS admin_name,
        sa.AlertNo, sa.alert_type, sa.area_text, sa.severity_override
    FROM NewsPost np
    JOIN Region r ON np.RegionID = r.RegionID
    JOIN Admin a ON np.AdminID = a.AdminID
    LEFT JOIN SafetyAlert sa ON np.NewsID = sa.NewsID
    WHERE np.RegionID IN (
        SELECT RegionID FROM Subscribes_to WHERE UserID = p_user_id
    )
    ORDER BY np.time_stamp DESC;
END //
DELIMITER ;

/*
 * sp_get_popular_places
 * ---------------------
 * finds the most popular places based on how many itinerary items reference them
 * basically a "trending" or "most visited" list - useful for recommendations
 * uses GROUP BY and COUNT to rank places, and LEFT JOINs to get the place type
 */
DROP PROCEDURE IF EXISTS sp_get_popular_places;

DELIMITER //
CREATE PROCEDURE sp_get_popular_places(
    IN p_limit INT
)
BEGIN
    SELECT p.PlaceID, p.name, p.address, p.coordinates, p.RegionID,
        r.name AS region_name,
        COUNT(ref.PlaceID) AS reference_count,
        CASE
            WHEN l.LandmarkID IS NOT NULL THEN 'landmark'
            WHEN e.EateryID IS NOT NULL THEN 'eatery'
            WHEN ts.StationID IS NOT NULL THEN 'transit'
            ELSE 'other'
        END AS placeType
    FROM Place p
    JOIN Region r ON p.RegionID = r.RegionID
    LEFT JOIN `References` ref ON p.PlaceID = ref.PlaceID
    LEFT JOIN Landmark l ON p.PlaceID = l.LandmarkID
    LEFT JOIN Eatery e ON p.PlaceID = e.EateryID
    LEFT JOIN TransitStation ts ON p.PlaceID = ts.StationID
    GROUP BY p.PlaceID, p.name, p.address, p.coordinates, p.RegionID,
        r.name, l.LandmarkID, e.EateryID, ts.StationID
    ORDER BY reference_count DESC
    LIMIT p_limit;
END //
DELIMITER ;

/*
 * sp_get_region_summary
 * ---------------------
 * gives you a full breakdown of everything in a region
 * counts places by type, news posts, incidents, and subscribers
 * this is the kind of query an admin dashboard would use
 */
DROP PROCEDURE IF EXISTS sp_get_region_summary;

DELIMITER //
CREATE PROCEDURE sp_get_region_summary(
    IN p_region_id INT
)
BEGIN
    SELECT * FROM Region WHERE RegionID = p_region_id;

    SELECT
        COUNT(*) AS total_places,
        SUM(CASE WHEN l.LandmarkID IS NOT NULL THEN 1 ELSE 0 END) AS landmark_count,
        SUM(CASE WHEN e.EateryID IS NOT NULL THEN 1 ELSE 0 END) AS eatery_count,
        SUM(CASE WHEN ts.StationID IS NOT NULL THEN 1 ELSE 0 END) AS station_count
    FROM Place p
    LEFT JOIN Landmark l ON p.PlaceID = l.LandmarkID
    LEFT JOIN Eatery e ON p.PlaceID = e.EateryID
    LEFT JOIN TransitStation ts ON p.PlaceID = ts.StationID
    WHERE p.RegionID = p_region_id;

    SELECT
        (SELECT COUNT(*) FROM NewsPost WHERE RegionID = p_region_id) AS news_count,
        (SELECT COUNT(*) FROM IncidentReport WHERE RegionID = p_region_id) AS incident_count,
        (SELECT COUNT(*) FROM Subscribes_to WHERE RegionID = p_region_id) AS subscriber_count;
END //
DELIMITER ;

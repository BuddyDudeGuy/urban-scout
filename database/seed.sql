USE UrbanScout;

-- Regions
INSERT INTO Region (RegionID, name, description, boundary) VALUES
(1, 'Downtown Seoul', 'Central business and tourist district', 'Jongno-gu / Jung-gu'),
(2, 'Gangnam', 'Southern Seoul commercial district', 'Gangnam-gu'),
(3, 'Hongdae', 'University area known for nightlife & art', 'Mapo-gu');

-- Users
INSERT INTO User (UserID, name, email, home_city) VALUES
(1, 'Alice Park', 'alice@example.com', 'Calgary'),
(2, 'Bob Kim', 'bob@example.com', 'Vancouver'),
(3, 'Charlie Lee', 'charlie@example.com', 'Toronto');

-- Admins (each assigned to one region)
INSERT INTO Admin (AdminID, name, email, role_level, RegionID) VALUES
(1, 'Soyeon Choi', 'soyeon@urbanscout.io', 'senior', 1),
(2, 'Minho Kang', 'minho@urbanscout.io', 'junior', 2),
(3, 'Jisoo Yoon', 'jisoo@urbanscout.io', 'senior', 3);

-- Places (NOW WITH RegionID)
INSERT INTO Place (PlaceID, name, address, coordinates, RegionID) VALUES
(1, 'Gyeongbokgung Palace', '161 Sajik-ro, Jongno-gu', '37.5796,126.9770', 1),
(2, 'Namsan Tower', '105 Namsangongwon-gil, Yongsan', '37.5512,126.9882', 1),
(3, 'Myeongdong Kyoja', '29 Myeongdong 10-gil, Jung-gu', '37.5636,126.9856', 1),
(4, 'Maple Tree House', '7 Apgujeong-ro 46-gil, Gangnam', '37.5273,127.0366', 2),
(5, 'Seoul Station', '405 Hangang-daero, Yongsan-gu', '37.5547,126.9707', 1),
(6, 'Hongik Univ. Station', '188 Yanghwa-ro, Mapo-gu', '37.5571,126.9246', 3),
(7, 'Gangnam Station', '396 Gangnam-daero, Gangnam-gu', '37.4979,127.0276', 2);

-- Landmarks
INSERT INTO Landmark (LandmarkID, landmark_type, hours) VALUES
(1, 'Palace', '09:00-18:00'),
(2, 'Observation', '10:00-23:00');

-- Eateries
INSERT INTO Eatery (EateryID, avg_cost_per_person) VALUES
(3, 9.00),
(4, 25.50);

-- Transit Stations
INSERT INTO TransitStation (StationID, station_code) VALUES
(5, 'SEL'),
(6, 'HUV'),
(7, 'GNM');

-- Transit Routes
INSERT INTO TransitRoute (RouteID, route_name, service_hours) VALUES
(1, 'Line 1 - Gyeongui-Jungang', '05:30-00:00'),
(2, 'Line 2 - Circle', '05:30-00:00'),
(3, 'Line 4 - Blue', '05:30-00:00');

-- Public Transit vehicles / services
INSERT INTO PublicTransit (TransitID, route_label, capacity, fare_price, vehicle_type) VALUES
(1, 'Line 1', 1500, 1.35, 'Subway'),
(2, 'Line 2', 1600, 1.35, 'Subway'),
(3, 'Line 4', 1400, 1.35, 'Subway'),
(4, '370', 50, 1.35, 'Bus'),
(5, 'KTX 101', 800, 45.00, 'Train');

-- Bus specialization
INSERT INTO Bus (TransitID, bus_number) VALUES
(4, '370');

-- Train specialization
INSERT INTO Train (TransitID, car_count) VALUES
(5, 10);

-- News Posts
INSERT INTO NewsPost (NewsID, title, severity, time_stamp, body_text, RegionID, AdminID) VALUES
(1, 'Jongno Cherry Blossom Festival This Weekend', 'low', '2026-03-18 10:00:00', 'Annual cherry blossom festival along Jongno streets. Expect large crowds.', 1, 1),
(2, 'Gangnam Road Closure for Marathon', 'medium', '2026-03-19 08:00:00', 'Gangnam-daero will be closed from 6 AM to 2 PM on Saturday.', 2, 2),
(3, 'Hongdae Street Performance Ban Lifted', 'low', '2026-03-17 14:30:00', 'Street performances are once again permitted in the Hongdae area.', 3, 3);

-- Safety Alerts (weak entity - composite PK)
INSERT INTO SafetyAlert (NewsID, AlertNo, alert_type, area_text, severity_override) VALUES
(2, 1, 'road_closure', 'Gangnam-daero between Sinnonhyeon and Yeoksam', 'high'),
(1, 1, 'crowd', 'Gwanghwamun Square', NULL);

-- Incident Reports
INSERT INTO IncidentReport (Report_ID, timestamp, category, description, severity, coordinates, UserID, RegionID) VALUES
(1, '2026-03-18 15:22:00', 'theft', 'Wallet stolen near Myeongdong shopping street.', 'medium', '37.5636,126.9860', 1, 1),
(2, '2026-03-19 09:05:00', 'road_hazard', 'Large pothole on sidewalk near Gangnam Station exit 3.', 'low', '37.4981,127.0278', 2, 2);

-- Itineraries
INSERT INTO Itinerary (ItineraryID, title, start_date, end_date, UserID) VALUES
(1, 'Seoul Weekend Trip', '2026-03-21', '2026-03-23', 1),
(2, 'Gangnam Food Tour', '2026-03-22', '2026-03-22', 2);

-- Itinerary Items (weak entity)
INSERT INTO ItineraryItem (ItineraryID, ItemNo, planned_time, notes) VALUES
(1, 1, '2026-03-21 09:00:00', 'Visit the palace in the morning'),
(1, 2, '2026-03-21 12:30:00', 'Lunch at Myeongdong Kyoja'),
(1, 3, '2026-03-21 15:00:00', 'Namsan Tower sunset'),
(2, 1, '2026-03-22 11:00:00', 'Korean BBQ at Maple Tree House');

-- References (ItineraryItem -> Place)
INSERT INTO `References` (PlaceID, ItineraryID, ItemNo) VALUES
(1, 1, 1),
(3, 1, 2),
(2, 1, 3),
(4, 2, 1);

-- Subscriptions (User subscribes to Region)
INSERT INTO Subscribes_to (UserID, RegionID) VALUES
(1, 1),
(1, 3),
(2, 2),
(3, 1),
(3, 2),
(3, 3);

-- Views (User views NewsPost)
INSERT INTO Views (UserID, NewsID) VALUES
(1, 1),
(1, 2),
(2, 2),
(3, 3);

-- Verifies (Admin verifies IncidentReport)
INSERT INTO Verifies (AdminID, ReportID, Status) VALUES
(1, 1, 'confirmed'),
(2, 2, 'pending');

-- Services (Place <-> TransitStation proximity)
INSERT INTO Services (PlaceID, StationID, distance_m) VALUES
(1, 5, 1200.0),
(2, 5, 2500.0),
(3, 5, 800.0),
(4, 7, 450.0),
(1, 6, 4500.0);

-- Serves (TransitRoute <-> TransitStation <-> PublicTransit)
INSERT INTO Serves (RouteID, StationID, TransitID) VALUES
(1, 5, 1),
(2, 6, 2),
(2, 7, 2),
(3, 5, 3);

-- Stops_At
INSERT INTO Stops_At (StationID, TransitID) VALUES
(5, 1),
(5, 3),
(6, 2),
(7, 2),
(6, 4),
(5, 5);

-- Arrival times
INSERT INTO Arrival_times (TransitID, StationID, arrival_time) VALUES
(1, 5, '06:00:00'),
(1, 5, '06:10:00'),
(2, 6, '06:05:00'),
(2, 7, '06:20:00'),
(3, 5, '06:03:00'),
(4, 6, '06:15:00'),
(5, 5, '07:00:00');

-- Departure times
INSERT INTO Departure_times (TransitID, StationID, departure_time) VALUES
(1, 5, '06:01:00'),
(1, 5, '06:11:00'),
(2, 6, '06:06:00'),
(2, 7, '06:21:00'),
(3, 5, '06:04:00'),
(4, 6, '06:16:00'),
(5, 5, '07:01:00');

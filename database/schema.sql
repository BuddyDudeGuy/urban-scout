-- Urban Scout - Unified Mobile Tourist Assistant
-- CPSC 471 - Group 61 - Database Schema
-- MySQL 8.0

CREATE DATABASE IF NOT EXISTS UrbanScout;
USE UrbanScout;

-- ----- Core User Tables -----

CREATE TABLE User (
    UserID      INT             PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    home_city   VARCHAR(100)
);

CREATE TABLE Region (
    RegionID    INT             PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    description TEXT,
    boundary    VARCHAR(255)
);

CREATE TABLE Admin (
    AdminID     INT             PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    role_level  VARCHAR(50),
    RegionID    INT             NOT NULL,
    FOREIGN KEY (RegionID) REFERENCES Region(RegionID)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ----- Place & Specializations (disjoint, partial) -----

CREATE TABLE Place (
    PlaceID     INT             PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(150)    NOT NULL,
    address     VARCHAR(255),
    coordinates VARCHAR(50),
    RegionID    INT             NOT NULL,
    FOREIGN KEY (RegionID) REFERENCES Region(RegionID)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Landmark (
    LandmarkID      INT         PRIMARY KEY,
    landmark_type   VARCHAR(50),
    hours           VARCHAR(100),
    FOREIGN KEY (LandmarkID) REFERENCES Place(PlaceID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Eatery (
    EateryID            INT             PRIMARY KEY,
    avg_cost_per_person DECIMAL(8,2),
    FOREIGN KEY (EateryID) REFERENCES Place(PlaceID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE TransitStation (
    StationID       INT         PRIMARY KEY,
    station_code    VARCHAR(20),
    FOREIGN KEY (StationID) REFERENCES Place(PlaceID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----- Transit Tables -----

CREATE TABLE TransitRoute (
    RouteID         INT             PRIMARY KEY AUTO_INCREMENT,
    route_name      VARCHAR(100)    NOT NULL,
    service_hours   VARCHAR(100)
);

CREATE TABLE PublicTransit (
    TransitID       INT             PRIMARY KEY AUTO_INCREMENT,
    route_label     VARCHAR(50),
    capacity        INT,
    fare_price      DECIMAL(6,2),
    vehicle_type    VARCHAR(20)
);

CREATE TABLE Bus (
    TransitID       INT         PRIMARY KEY,
    bus_number      VARCHAR(20),
    FOREIGN KEY (TransitID) REFERENCES PublicTransit(TransitID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Train (
    TransitID       INT         PRIMARY KEY,
    car_count       INT,
    FOREIGN KEY (TransitID) REFERENCES PublicTransit(TransitID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----- News & Safety -----

CREATE TABLE NewsPost (
    NewsID      INT             PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(200)    NOT NULL,
    severity    VARCHAR(20),
    time_stamp  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    body_text   TEXT,
    RegionID    INT             NOT NULL,
    AdminID     INT             NOT NULL,
    FOREIGN KEY (RegionID) REFERENCES Region(RegionID)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- SafetyAlert is a WEAK ENTITY identified by (NewsID, AlertNo)
CREATE TABLE SafetyAlert (
    NewsID              INT             NOT NULL,
    AlertNo             INT             NOT NULL,
    alert_type          VARCHAR(50),
    area_text           VARCHAR(255),
    severity_override   VARCHAR(20),
    PRIMARY KEY (NewsID, AlertNo),
    FOREIGN KEY (NewsID) REFERENCES NewsPost(NewsID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----- Incident Reports -----

CREATE TABLE IncidentReport (
    Report_ID   INT             PRIMARY KEY AUTO_INCREMENT,
    timestamp   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    category    VARCHAR(50),
    description TEXT,
    severity    VARCHAR(20),
    coordinates VARCHAR(50),
    UserID      INT             NOT NULL,
    RegionID    INT             NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User(UserID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (RegionID) REFERENCES Region(RegionID)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ----- Itinerary & Items -----

CREATE TABLE Itinerary (
    ItineraryID INT             PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(150)    NOT NULL,
    start_date  DATE,
    end_date    DATE,
    UserID      INT             NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User(UserID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ItineraryItem is a weak entity of Itinerary
CREATE TABLE ItineraryItem (
    ItineraryID INT         NOT NULL,
    ItemNo      INT         NOT NULL,
    planned_time DATETIME,
    notes       TEXT,
    PRIMARY KEY (ItineraryID, ItemNo),
    FOREIGN KEY (ItineraryID) REFERENCES Itinerary(ItineraryID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----- Junction / Relationship Tables -----

-- References: links ItineraryItem to a Place
CREATE TABLE `References` (
    PlaceID     INT     NOT NULL,
    ItineraryID INT     NOT NULL,
    ItemNo      INT     NOT NULL,
    PRIMARY KEY (PlaceID, ItineraryID, ItemNo),
    FOREIGN KEY (PlaceID)       REFERENCES Place(PlaceID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ItineraryID, ItemNo) REFERENCES ItineraryItem(ItineraryID, ItemNo)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Subscribes_to: User subscribes to Regions (M:N)
CREATE TABLE Subscribes_to (
    UserID      INT     NOT NULL,
    RegionID    INT     NOT NULL,
    PRIMARY KEY (UserID, RegionID),
    FOREIGN KEY (UserID)    REFERENCES User(UserID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (RegionID)  REFERENCES Region(RegionID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Views: User views NewsPost (M:N)
CREATE TABLE Views (
    UserID  INT     NOT NULL,
    NewsID  INT     NOT NULL,
    PRIMARY KEY (UserID, NewsID),
    FOREIGN KEY (UserID) REFERENCES User(UserID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (NewsID) REFERENCES NewsPost(NewsID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Verifies: Admin verifies IncidentReport
CREATE TABLE Verifies (
    AdminID     INT             NOT NULL,
    ReportID    INT             NOT NULL,
    Status      VARCHAR(30)     NOT NULL DEFAULT 'pending',
    PRIMARY KEY (AdminID, ReportID),
    FOREIGN KEY (AdminID)   REFERENCES Admin(AdminID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ReportID)  REFERENCES IncidentReport(Report_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Services: proximity between Place and TransitStation
CREATE TABLE Services (
    PlaceID     INT             NOT NULL,
    StationID   INT             NOT NULL,
    distance_m  DECIMAL(8,1),
    PRIMARY KEY (PlaceID, StationID),
    FOREIGN KEY (PlaceID)   REFERENCES Place(PlaceID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (StationID) REFERENCES TransitStation(StationID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Serves: TransitRoute served by PublicTransit at a TransitStation
CREATE TABLE Serves (
    RouteID     INT     NOT NULL,
    StationID   INT     NOT NULL,
    TransitID   INT     NOT NULL,
    PRIMARY KEY (RouteID, StationID, TransitID),
    FOREIGN KEY (RouteID)   REFERENCES TransitRoute(RouteID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (StationID) REFERENCES TransitStation(StationID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (TransitID) REFERENCES PublicTransit(TransitID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Stops_At: PublicTransit stops at a TransitStation
CREATE TABLE Stops_At (
    StationID   INT     NOT NULL,
    TransitID   INT     NOT NULL,
    PRIMARY KEY (StationID, TransitID),
    FOREIGN KEY (StationID) REFERENCES TransitStation(StationID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (TransitID) REFERENCES PublicTransit(TransitID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Arrival_times: scheduled arrivals for PublicTransit at a TransitStation
CREATE TABLE Arrival_times (
    TransitID       INT     NOT NULL,
    StationID       INT     NOT NULL,
    arrival_time    TIME    NOT NULL,
    PRIMARY KEY (TransitID, StationID, arrival_time),
    FOREIGN KEY (TransitID) REFERENCES PublicTransit(TransitID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (StationID) REFERENCES TransitStation(StationID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Departure_times: scheduled departures for PublicTransit at a TransitStation
CREATE TABLE Departure_times (
    TransitID       INT     NOT NULL,
    StationID       INT     NOT NULL,
    departure_time  TIME    NOT NULL,
    PRIMARY KEY (TransitID, StationID, departure_time),
    FOREIGN KEY (TransitID) REFERENCES PublicTransit(TransitID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (StationID) REFERENCES TransitStation(StationID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

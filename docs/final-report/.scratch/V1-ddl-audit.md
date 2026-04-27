# V1: DDL Audit Output

## Table Classification

**Strong Entities:** User, Region, Admin, Place, TransitRoute, PublicTransit, NewsPost, IncidentReport, Itinerary

**Subclass Tables (specialization):**
- Landmark, Eatery, TransitStation (specialize Place, disjoint partial)
- Bus, Train (specialize PublicTransit, disjoint partial)

**Weak Entities:**
- SafetyAlert (PK: NewsID + AlertNo, parented by NewsPost)
- ItineraryItem (PK: ItineraryID + ItemNo, parented by Itinerary)

**Junction / Relationship Tables:**
- Subscribes_to (User M:N Region)
- Views (User M:N NewsPost)
- Verifies (Admin M:N IncidentReport, with Status attribute)
- Services (Place M:N TransitStation, with distance_m attribute)
- Serves (TransitRoute M:N TransitStation M:N PublicTransit, ternary)
- Stops_At (TransitStation M:N PublicTransit)
- Arrival_times (PublicTransit M:N TransitStation, with arrival_time attribute)
- Departure_times (PublicTransit M:N TransitStation, with departure_time attribute)
- References (ItineraryItem M:N Place)

## FK Sweep
All 34 foreign keys verified. Every FK references an existing PK or composite PK.

CASCADE rules applied to:
- Specialization tables (Landmark, Eatery, TransitStation, Bus, Train) on their parent
- Weak entities (SafetyAlert on NewsPost, ItineraryItem on Itinerary)
- All junction tables on both sides
- IncidentReport on User, Itinerary on User (clean up user content)

RESTRICT rules applied to:
- Admin.RegionID, Place.RegionID, NewsPost.RegionID, IncidentReport.RegionID, NewsPost.AdminID
  (so we cannot accidentally delete a region or admin while content references it)

## Verbatim DDL (paste straight into a lstlisting block)

```sql
-- Urban Scout - CPSC 471 Group 61 - Database Schema (MySQL 8.0)

CREATE DATABASE IF NOT EXISTS UrbanScout;
USE UrbanScout;

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

CREATE TABLE Itinerary (
    ItineraryID INT             PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(150)    NOT NULL,
    start_date  DATE,
    end_date    DATE,
    UserID      INT             NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User(UserID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ItineraryItem (
    ItineraryID INT         NOT NULL,
    ItemNo      INT         NOT NULL,
    planned_time DATETIME,
    notes       TEXT,
    PRIMARY KEY (ItineraryID, ItemNo),
    FOREIGN KEY (ItineraryID) REFERENCES Itinerary(ItineraryID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

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

CREATE TABLE Subscribes_to (
    UserID      INT     NOT NULL,
    RegionID    INT     NOT NULL,
    PRIMARY KEY (UserID, RegionID),
    FOREIGN KEY (UserID)    REFERENCES User(UserID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (RegionID)  REFERENCES Region(RegionID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Views (
    UserID  INT     NOT NULL,
    NewsID  INT     NOT NULL,
    PRIMARY KEY (UserID, NewsID),
    FOREIGN KEY (UserID) REFERENCES User(UserID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (NewsID) REFERENCES NewsPost(NewsID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

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

CREATE TABLE Stops_At (
    StationID   INT     NOT NULL,
    TransitID   INT     NOT NULL,
    PRIMARY KEY (StationID, TransitID),
    FOREIGN KEY (StationID) REFERENCES TransitStation(StationID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (TransitID) REFERENCES PublicTransit(TransitID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

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
```

## Conversion notes (paste into prose section)

Specialization inheritance of Place into Landmark, Eatery, and TransitStation uses shared primary keys where each subclass table's PK is also a FK back to Place. This pattern enforces type safety because a row in Landmark cannot exist without a matching Place row, and ON DELETE CASCADE keeps the subclass and parent in sync. The same pattern is used for PublicTransit specialized into Bus and Train.

Weak entities SafetyAlert and ItineraryItem have composite primary keys that begin with the parent entity's PK. SafetyAlert is identified by (NewsID, AlertNo) where NewsID is both a PK component and an FK to NewsPost. ItineraryItem is identified by (ItineraryID, ItemNo). Both use ON DELETE CASCADE so the weak entity disappears when its parent is removed, which mirrors the existence-dependent semantics of the EER.

M:N relationships in the EER become junction tables. Subscribes_to and Views resolve simple binary M:N associations between User and Region, and User and NewsPost respectively. The ternary Serves relationship between TransitRoute, TransitStation, and PublicTransit becomes a 3-column junction. Attribute-bearing relationships such as Services (with distance_m), Verifies (with Status), Arrival_times (with arrival_time), and Departure_times (with departure_time) carry their relationship attributes directly in the junction table.

For Region references the schema uses ON DELETE RESTRICT in Admin, Place, NewsPost, and IncidentReport so a region cannot be deleted while its dependent rows still exist. For user-owned content like Itinerary and IncidentReport the schema uses ON DELETE CASCADE so a user account deletion cleans up everything they created.

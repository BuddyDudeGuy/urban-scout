# Groupmate's report prose (verbatim from his Final Report.pdf)

This is the text from his report. Use his voice and structure as the merge foundation. Do not copy verbatim into the LaTeX without light edits, but stay close to his phrasing.

---

## Abstract

Urban Scout is a mobile-friendly web application designed to reduce the fragmentation of travel information for tourists navigating unfamiliar cities. In many real-world situations, travelers must switch between multiple platforms to access transit schedules, restaurant information, landmarks, local events, and safety updates. This creates inefficiency, confusion, and unnecessary cognitive overload, especially for short-term visitors who need quick and reliable access to location-based information. Urban Scout addresses this problem by integrating these services into a single relational database-backed system.

The project was implemented using a MySQL database, an Express/Node.js backend, and a React frontend with a mobile-first interface. The system supports multiple user roles, primarily tourists and administrators. Tourists can browse places by region, view transit-related information, read localized news and safety alerts, submit incident reports, and manage itineraries. Administrators can manage news content and verify reported incidents. The database design emphasizes relational connections between regions, places, transit services, news posts, alerts, users, and itineraries, allowing the application to present connected information that would normally be spread across different platforms.

Overall, Urban Scout demonstrates how a well-designed relational database can support a unified user experience for tourism-related planning and awareness. By combining transportation, destination browsing, local updates, and trip planning into one system, the project reduces app fatigue and improves usability for travelers on the go.

---

## 1. Introduction

Modern tourism often depends on multiple disconnected digital services. A traveler may need one application for maps, another for transit schedules, another for restaurant recommendations, and yet another source for local news or safety-related updates. As a result, users are forced to repeatedly switch contexts and manually combine information from several unrelated platforms. This fragmented experience is inconvenient, time-consuming, and especially difficult for tourists who are unfamiliar with the area they are visiting.

Urban Scout was designed to address this problem by providing a centralized system for tourism-related information. The project focuses on integrating key categories of data that are often used together in practice: places of interest, eateries, transit stations and schedules, localized news, safety alerts, incident reports, and itineraries. Rather than treating these pieces of information as separate resources, Urban Scout connects them through a relational database structure so that users can interact with them in a unified way.

The system created for this project is a mobile-friendly web application supported by a MySQL relational database, an Express/Node.js backend, and a React frontend. The primary end users are tourists, who can explore regions, browse places, check transit information, read local updates, report incidents, and organize their travel plans. A secondary user group consists of administrators, who are responsible for posting regional news and verifying incident reports. Through this design, Urban Scout demonstrates how database-driven integration can improve usability and reduce the burden of managing travel information across multiple disconnected applications.

---

## 2. Project Design

### 2.1 Real-World Scenario

Urban Scout was designed around a realistic tourism scenario in which short-term visitors need quick access to multiple types of local information while moving through a city. In practice, tourists often rely on several disconnected platforms to plan their day. A traveler may use one service to find landmarks, another to locate restaurants, another to check transit schedules, and another to search for local events, closures, or safety concerns. This separation of information creates unnecessary friction, especially for users who are unfamiliar with the city and need fast, location-aware decisions.

The project models a tourism support system for Seoul, with data organized into major regions such as Downtown Seoul, Gangnam, and Hongdae. These regions help structure the application and allow the system to connect transit, destinations, local updates, and user activity in a meaningful way. By placing all of this information in one relational database, Urban Scout reduces context switching and allows users to interact with related information through a single interface.

### 2.2 User Groups

The system was designed for two primary categories of users: regular users and administrators.

**Regular Users**

Regular users represent tourists or visitors using the platform to explore the city and organize their travel plans. Their main goals are to find places of interest, understand how to move between locations, stay informed about local conditions, and build simple itineraries.

The system allows regular users to:
- log in using a seeded email account
- browse regions and subscribe to regions of interest
- view places such as landmarks, eateries, and transit stations
- access transit-related information for selected stations
- read region-based news and safety alerts
- submit incident reports connected to a region
- create and manage itineraries
- view their own submitted reports

These functions were chosen because they reflect common tourist needs: discovering what exists in an area, deciding where to go, understanding how to get there, and staying aware of ongoing events or hazards.

**Administrators**

Administrators represent trusted system managers who maintain local updates and review user-submitted reports. Their role supports the reliability and usefulness of the platform.

The system allows administrators to:
- log in through the admin interface
- access protected admin pages
- review incident reports submitted by users
- verify or update the status of reports
- create and manage regional news posts
- contribute to the safety and information layer of the application
- add new places (landmarks, eateries, transit stations) to a region
- add and remove transit routes and link station-vehicle pairs as stops

This user group was included because the project is not only a read-only guide. It also models a system where information can be maintained and moderated, making the application more realistic and dynamic.

### 2.3 Core Design Goals

Several design goals guided the structure of the project.

**Unified Information Access**

The main goal was to combine multiple categories of travel-related data into one database-backed system. Instead of forcing users to mentally connect unrelated apps, the system was designed to connect places, regions, transit, safety information, and itineraries through explicit relationships in the schema.

**Relational Integration**

A central goal of the database design was to ensure that the major entities were meaningfully linked. For example:
- each place belongs to a region
- transit stations are represented as places
- nearby places can be connected to stations
- news posts are associated with regions
- safety alerts are attached to news posts
- incident reports are tied to both users and regions
- itinerary items reference specific places

This relational structure is one of the most important aspects of the project because it supports the "unified assistant" concept at the data level, not just in the user interface.

**Mobile-Friendly Interaction**

Because tourists are likely to use the system while moving through a city, the interface was designed with a mobile-first approach. Navigation was kept simple, page content was organized into cards and lists, and the app was built to work well on smaller screens. This goal influenced both the frontend layout and the choice to keep user actions straightforward.

**Role-Based Access**

The project also aimed to support different types of users without overcomplicating the experience. Regular users and administrators have different responsibilities, so the system includes role-based access to ensure that only administrators can perform moderation tasks such as managing news or verifying reports.

### 2.4 Major Entities and Relationships

The ER design centers around a set of entities that model the tourism scenario.

**Region**

A Region represents a major area of the city. Regions organize places, news, and user subscriptions. They help group related information and allow region-based browsing and filtering.

**Place**

A Place is a general entity used to represent locations relevant to the user. This entity is specialized into subtypes such as landmarks, eateries, and transit stations. This design avoids duplication while allowing each subtype to store its own attributes.

**Landmark, Eatery, and TransitStation**

These entities specialize Place:
- Landmark stores landmark-specific details such as type and hours
- Eatery stores dining-related details such as average cost
- TransitStation stores transit-specific details such as station code

This specialization structure was chosen to reflect the fact that these entities share common location data but also have distinct properties.

**PublicTransit and TransitRoute**

PublicTransit represents specific transit services such as subway lines, buses, or trains. TransitRoute provides route-level information such as route names and service hours. The relationships among routes, stations, and transit services allow the application to display schedules and station-level service information.

**NewsPost and SafetyAlert**

NewsPost stores regional updates and local information. SafetyAlert is modeled as a weak entity attached to a news post, allowing a single news item to contain one or more specific alerts. This is useful for representing situations where a larger event has multiple localized impacts.

**IncidentReport**

An IncidentReport stores user-submitted safety or hazard information. Each report is linked to the user who submitted it and the region in which it occurred. This allows the system to collect user-generated information while still preserving geographic context.

**Itinerary and ItineraryItem**

Itinerary stores a user's travel plan. ItineraryItem is a weak entity that represents individual scheduled items within an itinerary. Each itinerary item can reference a place, allowing users to connect planned activities to actual destinations in the database.

### 2.5 Relationship Design

Several relationships were included to capture how the different entities interact in practice.

- A user can subscribe to one or more regions.
- A user can create one or more itineraries.
- An itinerary includes one or more itinerary items.
- An itinerary item references a place.
- A place belongs to a region.
- An admin is assigned to a region.
- An admin can verify incident reports.
- A news post is published for a region.
- A news post can contain safety alerts.
- A transit route serves a transit station.
- A place can be associated with a nearby transit station through a proximity relationship.

These relationships were intentionally chosen to support the features visible in the interface. They are not abstract additions, each one supports either browsing, filtering, reporting, route display, or planning.

### 2.6 ER Diagram Discussion

The ER diagram for Urban Scout reflects the complete conceptual design of the project. It includes strong entities, weak entities, specialization, and many-to-many relationships resolved through associative structures.

The most notable features of the ER design are:
- specialization from Place into Landmark, Eatery, and TransitStation
- weak entity treatment of SafetyAlert
- weak entity treatment of ItineraryItem
- associative relationships connecting users to regions, places to stations, and routes to stations and transit services

### 2.7 Design Rationale

The final design reflects a balance between realism and project scope. The system is complex enough to demonstrate meaningful database concepts such as specialization, weak entities, role-based users, and many-to-many relationships, but still focused enough to be implemented within a course project. The schema was designed not only to satisfy database design requirements, but also to support visible frontend functionality.

As a result, Urban Scout is more than a collection of unrelated tables. It is a relational system in which data about places, transit, alerts, reports, and travel plans can be combined to support a coherent user experience.

---

## 3. Implementation

### 3.1 Relational Model Overview

After the conceptual design was finalized through the ER diagram, the next step was to convert that design into a relational schema suitable for implementation in a relational DBMS. The resulting schema was designed to preserve the structure of the conceptual model while supporting the application features required by Urban Scout.

The implementation includes relations for users, administrators, regions, places, specialized place types, transit services, transit routes, news posts, safety alerts, incident reports, itineraries, and associative relationships connecting those entities. The schema reflects the standard transformation process from entity-relationship design to a relational model: strong entities became base relations, specialization was implemented through subtype tables, weak entities were converted using composite keys, and many-to-many relationships were represented through linking tables.

The final relational structure supports both the frontend interface and backend endpoints. Each table has a clear role in storing core data or representing relationships between entities, which allows the system to retrieve connected information efficiently.

### 3.2 Conversion from ER Diagram to Relational Schema

The relational schema was created by following the standard ER-to-relational mapping approach.

**Strong Entities**

Strong entities in the ER diagram were mapped directly into tables with primary keys. Examples include: User, Admin, Region, Place, TransitRoute, PublicTransit, NewsPost, IncidentReport, Itinerary. Each of these relations has its own primary key and stores attributes that belong directly to that entity.

**Specialization**

One of the important design decisions in the project was the specialization of Place into Landmark, Eatery, and TransitStation. Instead of storing all place-specific attributes in a single large table, the implementation uses separate subtype tables. Place stores shared attributes such as name, address, coordinates, and region. Landmark stores landmark-specific data, Eatery stores eatery-specific data, TransitStation stores station-specific data.

This design was chosen because it keeps the database normalized and avoids storing many null attributes in a single universal place table. It also reflects the conceptual distinction between different kinds of locations while preserving their shared identity.

**Weak Entities**

Two important weak entities appear in the schema: SafetyAlert and ItineraryItem. SafetyAlert depends on NewsPost, so it was implemented with a composite key including the owning news post identifier and a local alert number. ItineraryItem depends on Itinerary, so it was implemented with a composite key including the itinerary identifier and an item number.

The use of weak entities was an important part of the project because it allowed the schema to represent dependent data in a structured and relationally correct way.

**Many-to-Many Relationships**

Several many-to-many relationships in the ER diagram were converted into separate associative tables: user subscriptions to regions, itinerary items referencing places, routes serving stations through transit services, places being near transit stations, users viewing news posts, administrators verifying incident reports.

These relationships were implemented through linking tables such as Subscribes_to, References, Serves, Services, Views, Verifies. This decision was necessary because many-to-many relationships cannot be represented directly in a normalized relational schema without introducing a separate relation.

### 3.3 Significant Design Decisions

Several implementation decisions were especially important during the conversion process.

**Use of Separate Admin and User Tables**

The project keeps User and Admin as separate tables rather than placing both roles into one shared account table. This was done to keep the distinction between tourists and administrators explicit in both the schema and the application logic. Because the two user types have different roles and responsibilities, separating them simplified access control and role-based routing in the backend.

**Modeling Transit with Multiple Related Tables**

Transit information was not stored in a single table. Instead, the design separates transit services (PublicTransit), route information (TransitRoute), stations (TransitStation), station-route-service relationships (Serves), stop relationships (Stops_At), and arrival and departure schedules (Arrival_times, Departure_times).

This decision increased the complexity of the schema, but it allowed the project to model the transit system in a much more realistic way. It also supported one of the project's showcase queries: retrieving the full schedule and service information for a selected station.

**Region-Centered Organization**

Another major implementation choice was to make Region a central organizing entity. Instead of treating the city as a single undifferentiated space, the schema uses regions to group places, news, subscriptions, reports, and administrative responsibilities. This makes filtering and personalization much easier in the application.

### 3.4 DBMS Selection

The project was implemented using MySQL as the DBMS.

MySQL was selected for several reasons:
- it is a widely used relational database system
- it aligns well with the course focus on SQL and relational database design
- it supports foreign keys, joins, procedures, and indexing features needed for the project
- it integrates smoothly with the Node.js backend using the mysql2 library
- it is accessible and practical for local development and demonstration

Because the project emphasizes database concepts, MySQL was an appropriate choice. It allowed the team to implement the schema directly in SQL and demonstrate clear understanding of relational modeling, rather than relying on an abstraction layer such as an ORM.

### 3.5 Database Implementation

The database implementation was organized through SQL scripts that define the schema, insert sample data, and create stored procedures.

The implementation includes:
- a schema script to create all relations and constraints
- a seed script to populate the database with sample data
- a script for stored procedures
- a drop/reset script used during testing and redevelopment

This structure made the project easier to maintain and reset during development. It also ensured that the same database could be recreated consistently for testing, demo preparation, and final submission.

### 3.6 Transactions, Queries, and Backend Endpoints

The database is accessed through an Express/Node.js backend that exposes REST-style endpoints. These endpoints allow the frontend to request data and perform actions without directly interacting with SQL.

Below are the major groups of implemented endpoints. (HE STOPS HERE — JUST LISTS GROUPS WITH BULLETS, NO ACTUAL SQL — THIS IS WHERE WE INSERT V3 CONTENT)

### 3.7 Example SQL Operations

(HE JUST LISTS SELECT/INSERT/UPDATE/DELETE TYPES WITH NO ACTUAL SQL — REPLACE WITH REAL EXAMPLES)

### 3.8 Stored Procedures and Special Queries

The project includes stored procedures to support repeated or more structured operations. One example is the nearby-places lookup for a transit station, which helps connect transportation data to tourism-related destinations. (HE STOPS HERE — REPLACE WITH FULL 9 STORED PROCEDURE DETAILS FROM V2 SCRATCH FILE)

### 3.9 Backend Integration

The database is connected to the application through a Node.js backend using Express and the mysql2 library. The backend acts as the bridge between the React frontend and the MySQL database. This separation allows:
- the frontend to stay focused on presentation and user interaction
- the backend to manage validation, authorization, and database access
- the database to remain the central source of structured data

This architecture also made development more organized. Frontend pages could request data through specific endpoints, while database logic remained centralized in backend route handlers and SQL operations.

### 3.10 Summary of Implementation

The implementation phase successfully translated the project design into a functioning relational web application. The schema preserves the main ideas of the ER model, including specialization, weak entities, and associative relationships. MySQL was used to implement the relational structure, and Express/Node.js was used to expose backend endpoints that interact with the database. Together, these components support the major features of Urban Scout, including place browsing, transit viewing, localized news and alerts, incident reporting, and itinerary management.

---

## 4. Visual Interface

The visual interface of Urban Scout was designed to support quick, mobile-friendly interaction for users who may be navigating the system while traveling. Since the project scenario focuses on tourists on the move, usability and readability were treated as important design concerns throughout the frontend implementation.

The application frontend was built using React with Vite, styled using Tailwind CSS, and organized into page-based views with reusable components. This stack allowed the project to support responsive layouts, fast development, and a clear separation between shared interface elements and page-specific functionality.

### 4.1 Design Goals for the Interface

The main visual design goals were:
- simplicity
- clarity
- mobile responsiveness
- fast access to key features
- low navigation effort

These goals were chosen because the intended users are not expected to spend a long time learning the interface. Instead, they should be able to log in and quickly access transit, places, alerts, and itineraries with minimal friction.

### 4.2 General Layout and Navigation

The interface uses a clean and consistent layout across major pages. Important user-facing features are accessible through a persistent bottom navigation bar, which is especially useful on mobile-sized screens. This navigation style supports thumb-friendly access and reduces the need for deep menu navigation.

The main user-facing pages include: Home, Places, Transit, News, Report, Trips.

This structure was chosen so that the most important categories of information are always close at hand. Rather than nesting key features behind multiple clicks, the interface exposes them directly in the primary navigation.

In addition to regular user pages, the system includes separate admin pages for tasks such as report verification and news management. This helps preserve role-based separation while keeping each interface focused on the needs of its specific user type.

### 4.3 Home Page

The home page acts as the central landing page after login. It introduces the user to the application and displays region-related information in a clear card-based format. Because regions are an important organizing concept in the database, surfacing them on the home page helps users understand how the system is structured.

The home page also includes summary information and a clear entry point into the rest of the application. Its purpose is not only decorative but functional: it provides orientation and gives the user a quick sense of what is available.

### 4.4 Places Interface

The places interface was designed to help users browse destinations in an intuitive way. Users can filter places by region and category, such as landmarks, eateries, or transit stations. This supports practical tourism use cases such as: finding attractions in a region, locating food options nearby, identifying station-based destinations.

Cards are used to display places because they allow important information such as names, categories, and addresses to be scanned quickly. This format is more user-friendly than presenting the same information as dense text or raw table data.

### 4.5 Transit Interface

The transit page presents route and station-related information in a structured format. Users can select a station and view arrivals, departures, serving routes, and nearby places. Because transit data can become visually overwhelming if poorly presented, the page organizes information into grouped sections with clear labels.

This page is one of the strongest examples of the project's integrated design. It combines multiple layers of information that would normally require separate applications or manual effort from the user. The interface presents these relationships in a way that is easier to understand than raw backend data.

### 4.6 News and Safety Alerts Interface

The news page was designed to support both awareness and filtering. Users can browse regional news posts and view associated safety alerts. The interface presents each news post in a card-based layout with important metadata such as severity, date, region, and linked alert information.

This page is especially important from a usability perspective because it adds a local awareness layer to the tourism experience. A tourist may not only want to know what places exist, but also whether there are closures, crowds, hazards, or events that affect their plans. The visual grouping of posts and alerts helps users process this information more efficiently.

### 4.7 Incident Report Interface

The report submission page uses a form-based layout with structured input fields for region, category, severity, and description. This page was designed to keep user input straightforward and focused. Because many users may only submit a report once or occasionally, the form avoids unnecessary complexity and aims for clarity.

In a complete use scenario, the usability of this form matters because it affects whether users are willing to contribute useful information to the system. The design therefore emphasizes simple field selection, recognizable labels, and a direct submission flow.

### 4.8 Itinerary Interface

The itinerary pages allow users to view, create, and manage travel plans. The design is centered around a list of itineraries and detail views for specific trips. Since itineraries are planning-oriented features, the interface aims to be structured and easy to scan rather than visually dense.

The itinerary feature helps demonstrate that the interface supports not only information browsing, but also user-driven organization of travel activity.

### 4.9 Admin Interface

The admin interface was designed separately from the tourist-facing side of the application. It includes pages for dashboard-style management, incident report verification, news management, place management, and transit route management. These pages focus more on clarity and efficiency than on tourism-style browsing.

This separation improves usability because administrators and tourists have different goals. Administrators need direct access to moderation and content tasks, while regular users need location-based exploration and planning tools.

### 4.10 Interface Friendliness and Usability

Several qualities contribute to the friendliness and usability of the interface:

**Consistency** — the application uses consistent page structure, spacing, and navigation patterns across major views. This helps users move between pages without relearning the interface.

**Readability** — information is grouped into cards, lists, and labeled sections rather than being displayed as raw data. This makes the application much easier to use for non-technical users.

**Mobile-First Design** — the layout and navigation were designed with smaller screens in mind. Because the intended users are tourists, this is an especially important design strength.

**Low Learning Curve** — the interface avoids excessive feature depth and instead focuses on the main flows users are likely to need. This makes the app easier to understand quickly.

**Connection to Real Tasks** — each page supports a recognizable real-world action, such as browsing attractions, checking transit, reading local updates, reporting incidents, or planning a trip. This makes the interface feel purposeful rather than artificially constructed.

### 4.11 Summary

The visual interface of Urban Scout was designed to support a unified, usable, and mobile-friendly experience. It connects the database-backed features of the system to a set of pages that are practical for both tourists and administrators. The interface emphasizes clarity, direct access to major functions, and readable presentation of linked information. As a result, it supports the overall project goal of reducing fragmentation in travel-related information access.

---

## 5. Quick User Guide

This section provides a short guide for using Urban Scout as a regular user or administrator. The purpose of this guide is to make the project understandable and usable for someone other than the developers or teaching assistant.

### 5.1 Running the Project

To use the project locally, the following components must be available:
- MySQL server with the UrbanScout database loaded
- backend server running with Node.js and Express
- frontend client running with React and Vite

The database should first be created and populated using the provided SQL scripts:
- schema script
- seed script
- stored procedures script

After the database is ready: start the backend server, start the frontend development server, open the frontend URL in a browser. The backend and frontend must both be running for the application to work correctly.

### 5.2 Logging In

The login page supports access for both regular users and administrators.

**Regular User Login** — A regular user selects the user mode on the login page and enters one of the seeded user email addresses.

**Administrator Login** — An administrator selects the admin mode on the login page and enters one of the seeded admin email addresses.

The project currently uses a simplified email-based login process for demonstration purposes. This allows the system to focus on role-based access and application workflow rather than full production authentication.

### 5.3 Using the Application as a Regular User

After login, a regular user can access the main user-facing pages through the bottom navigation bar.

(HE LISTS PAGES WITH 1-LINE DESCRIPTIONS — Home, Places, Transit, News, Report, Trips, My Reports — REPLACE WITH FULL WALKTHROUGHS PER PAGE WITH SCREENSHOT PLACEHOLDERS)

### 5.4 Using the Application as an Administrator

Administrators log in through admin mode and access a separate set of features.

(HE LISTS Admin Dashboard, Verify Reports, Manage News — INCOMPLETE, MISSING Manage Places AND Manage Routes — REPLACE WITH FULL WALKTHROUGHS)

### 5.5 Main Functionalities Demonstrated by the Web Interface

(HE LISTS BULLETS — KEEP BUT EXTEND TO ALL FEATURES INCLUDING ROUTES MANAGEMENT)

### 5.6 Notes for Smooth Usage

For the smoothest experience: ensure the database is fully loaded with the seeded data, ensure both backend and frontend servers are running, use the seeded email accounts provided with the project, keep the backend connected to the correct MySQL database, refresh the page after backend or database changes if needed.

### 5.7 Summary

Urban Scout is intended to be straightforward to use even for someone unfamiliar with the project's codebase. The user-facing side supports browsing, planning, and awareness tasks, while the administrator side supports moderation and content management. Together, these interfaces demonstrate the main features of the system in a way that is practical, understandable, and consistent with the project goals.

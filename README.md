# 🌍 ClimateShield

> **"Understand climate risk before it becomes a disaster."**

ClimateShield is a production-ready, full-stack **Hyperlocal Climate Early Warning and Risk Assessment Platform**. It empowers individuals, farmers, outdoor workers, and community officers to monitor localized environmental parameters, receive early warning bulletins, simulate future climate scenarios, and explore climate risks worldwide.

---

## 📑 Table of Contents

1. [Product Overview](#1-product-overview)
2. [Key Features](#2-key-features)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Application Directory Structure](#5-application-directory-structure)
6. [Prerequisites & Installation](#6-prerequisites--installation)
7. [Database Setup & Migrations](#7-database-setup--migrations)
8. [Environment Variables](#8-environment-variables)
9. [REST API Documentation](#9-rest-api-documentation)
10. [Demo Mode vs. Live Sensors](#10-demo-mode-vs-live-sensors)
11. [Progressive Data Source Integration Guide](#11-progressive-data-source-integration-guide)
12. [Transparent Environmental Risk Engine](#12-transparent-environmental-risk-engine)
13. [Future Roadmap](#13-future-roadmap)

---

## 1. Product Overview

Climate risk is inherently localized. Two farms separated by five miles or a hill contour experience drastically different soil desiccation rates, flash flood runoffs, and daytime wet-bulb heat indices. Generic metropolitan weather reports fail to capture these micro-variations.

ClimateShield connects directly with open meteorological reanalysis and satellite remote sensing layers to deliver:
* **🔥 Extreme Heat & Thermal Stress Evaluation** (Wet-bulb index, radiometric land surface temperature, daytime solar irradiance).
* **💧 Drought & Hydrological Deficit Tracking** (7-day precipitation anomalies, volumetric soil moisture, Sentinel-2 NDVI canopy index).
* **🌧️ Flood & Runoff Vulnerability Assessment** (24h rainfall influx, antecedent ground saturation, Digital Elevation Model slope gradient).

---

## 2. Key Features

* **Hyperlocal Dashboard**: Real-time multi-hazard composite risk index (0–100) across 4 standard tiers: `LOW` (0–24), `MODERATE` (25–49), `HIGH` (50–74), and `EXTREME` (75–100).
* **5-Stage Early Signals System**: Transitions smoothly through `NORMAL` → `EARLY SIGNAL` → `WATCH` → `HIGH RISK` → `EXTREME`, alerting users to subtle trending indicators prior to disaster thresholds.
* **Potential Impact Chain**: Visual step-by-step physical cascades (e.g., *Intense Precipitation → Topsoil Saturation → Drainage Canal Stress → Lowland Inundation*).
* **What-If Climate Scenario Simulator**: Interactive sliders for temperature (±°C), precipitation (±%), and humidity (±%) to stress-test local risk vectors in real time.
* **Forward Risk Timeline**: Today → Tomorrow → 3 Days → 7 Days with interactive hazard trajectory charts.
* **Explainable Risk Intelligence**: Deconstructs every risk score into quantifiable physical variables with weight percentages and explanations.
* **Structured 5-W Bulletins**: Active warnings specify **WHAT**, **WHERE**, **WHEN**, **WHY**, and **WHAT TO DO** (clearly separated from official emergency orders).
* **Role-Personalized Recommendations**: Distinct operational guidance tailored to **Farmers** (irrigation timing, mulching), **Outdoor Workers** (hydration breaks, shade limits), and **Residents**.
* **Interactive Geospatial Map**: Leaflet dark-theme map with interactive risk buffer zones, legend, and click-to-analyze coordinate exploration.
* **Explore Any Location**: Search any city, district, or village worldwide (e.g., Bhopal, Indore, Delhi, London, Phoenix).
* **Temporal Risk History**: Longitudinal tracking filterable by 7 days, 30 days, or 3 months.
* **Automated Background Monitoring**: Automated cron job (`0 */6 * * *`) that scans all registered locations, re-evaluates risk indices, and dispatches multi-channel alerts (In-App, Email, SMS).
* **Manual Diagnostic Trigger**: Protected endpoint `POST /api/monitor/run` with a live monitoring audit report generator.
* **Demo Mode Toggle**: One-click switch between live satellite/weather APIs and deterministic local simulation data for offline testing and judging.

---

## 3. System Architecture

```text
                                 👤 USER
                                    │
                                    ▼
                             LOGIN / SIGNUP
                      (Bcrypt Password Hashing & JWT)
                                    │
                                    ▼
                            USER PROFILE & ROLE
                    (Resident / Farmer / Worker / Other)
                                    │
                                    ▼
                         📍 PRIMARY MONITORED LOCATION
                      (Coordinates, Elevation, City, Crop)
                                    │
                                    ▼
            ┌───────────────────────────────────────────────┐
            │         MODULAR ENVIRONMENTAL DATA LAYER       │
            ├───────────────────────────────────────────────┤
            │  • weatherService      (Open-Meteo Weather)   │
            │  • rainfallService     (Precipitation Anomaly)│
            │  • satelliteService    (Land Surface Temp LST)│
            │  • vegetationService   (Sentinel NDVI Proxy)  │
            │  • soilMoistureService (Volumetric Topsoil %) │
            │  • geospatialService   (Digital Elevation DEM)│
            │  • locationService     (Geocoding & Reverse)  │
            └───────────────────────┬───────────────────────┘
                                    │
                                    ▼
                        DATA PROCESSING & NORMALIZATION
                                    │
                                    ▼
                        🧠 PHYSICAL RISK ENGINE
                  (Rule-Based, Transparent, Configurable)
                                    │
                     ┌──────────────┼──────────────┐
                     ▼              ▼              ▼
                 🔥 HEAT        💧 DROUGHT     🌧 FLOOD
                     │              │              │
                     └──────────────┼──────────────┘
                                    ▼
                           COMPOSITE RISK SCORE
                        (0–100 & 4 Severity Levels)
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
              PERSONAL DASHBOARD            EXPLORE ANY LOCATION
             (Background Monitoring)        (Ad-Hoc Analysis)
                     │                             │
                     ▼                             ▼
              EARLY SIGNALS &               FORWARD TIMELINE &
               IMPACT CHAINS                 SCENARIO MODELING
                     │
                     ▼
             ALERT & NOTIFICATION ENGINE
          (Threshold Comparison & Dispatch)
                     │
                     ▼
          🚨 MULTI-CHANNEL BULLETIN
          (WHAT • WHERE • WHEN • WHY • WHAT TO DO)
```

---

## 4. Technology Stack

### Frontend
* **React 19** with **TypeScript** and **Vite**
* **Tailwind CSS 3.4** for modern, responsive dark geospatial design
* **Leaflet & React Leaflet** for geospatial map visualization with dark basemaps and dynamic risk zones
* **Lucide React** for modern climate and operational iconography
* Context API for global authentication, location state, and demo mode toggling

### Backend
* **Node.js 24+** & **Express** with **TypeScript (TSX)**
* **Bcryptjs** for secure salt-hashed password authentication
* **JSON Web Tokens (JWT)** for stateless, protected API routes
* **Zod** for schema validation on all incoming request bodies
* **Node-Cron** for scheduled automated climate monitoring cycles
* **Native Fetch API** with timeout controllers for external sensor telemetry

### Database
* **PostgreSQL Schema & Migrations**: Located at `database/schema/migrations/001_initial_schema.sql`.
* **Zero-Friction Local Persistence Engine**: File-backed database stored at `backend/data/climateshield-db.json` with synchronous atomic persistence, in-memory caching, and pre-seeded demo records for immediate, dependency-free local evaluation.

---

## 5. Application Directory Structure

```text
ClimateShield/
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── RiskBadge.tsx
│   │   │   ├── RiskScoreCard.tsx
│   │   │   ├── HazardRiskCard.tsx
│   │   │   ├── RiskTimeline.tsx
│   │   │   ├── ExplainableRisk.tsx
│   │   │   ├── ClimateWarningCard.tsx
│   │   │   ├── EarlySignalsWidget.tsx
│   │   │   ├── ImpactChainWidget.tsx
│   │   │   ├── ScenarioSimulator.tsx
│   │   │   ├── LeafletRiskMap.tsx
│   │   │   ├── LocationModal.tsx
│   │   │   └── AlertDetailModal.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx # User session, token, and demo mode state
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ExplorePage.tsx
│   │   │   ├── AlertsPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── AuthModal.tsx
│   │   ├── services/
│   │   │   └── api.ts          # REST API client
│   │   ├── types/
│   │   │   └── index.ts        # Frontend type contracts
│   │   ├── App.tsx             # Main application orchestrator
│   │   ├── main.tsx
│   │   └── index.css           # Tailwind + Leaflet dark theme
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts          # Central environment config
│   │   ├── db/
│   │   │   └── index.ts        # Database adapter & seeded demo store
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT authentication guards
│   │   │   └── errorHandler.ts # Global API error handler
│   │   ├── services/           # Discrete environmental data layers
│   │   │   ├── weatherService.ts
│   │   │   ├── rainfallService.ts
│   │   │   ├── satelliteService.ts
│   │   │   ├── vegetationService.ts
│   │   │   ├── soilMoistureService.ts
│   │   │   ├── geospatialService.ts
│   │   │   ├── locationService.ts
│   │   │   ├── riskService.ts
│   │   │   ├── notificationService.ts
│   │   │   └── monitoringService.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── locationController.ts
│   │   │   ├── riskController.ts
│   │   │   ├── alertController.ts
│   │   │   ├── profileController.ts
│   │   │   └── monitorController.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── locationRoutes.ts
│   │   │   ├── weatherRoutes.ts
│   │   │   ├── riskRoutes.ts
│   │   │   ├── alertRoutes.ts
│   │   │   ├── profileRoutes.ts
│   │   │   └── monitorRoutes.ts
│   │   ├── jobs/
│   │   │   └── monitorJob.ts   # Automated cron monitoring
│   │   ├── types/
│   │   │   └── shared.ts       # Backend type definitions
│   │   └── index.ts            # Express server entry point
│   ├── data/                   # Persistent local database store
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── shared/
│   └── types/
│       └── index.ts            # Canonical shared interface contracts
│
├── database/
│   └── schema/
│       └── migrations/
│           └── 001_initial_schema.sql # PostgreSQL DDL script
│
├── package.json                # Root workspace scripts
└── README.md
```

---

## 6. Prerequisites & Installation

### Requirements
* **Node.js**: v18.0.0 or higher (v24.x recommended)
* **npm**: v9.0.0 or higher

### 1. Clone & Install Dependencies
```bash
# In the project root:
npm install

# Install backend dependencies:
cd backend && npm install

# Install frontend dependencies:
cd ../frontend && npm install
```

### 2. Configure Environment Files
A default `.env` is already created in `backend/.env`. You can copy or verify:
```bash
cd backend
cp .env.example .env
```

### 3. Run Development Servers
You can run both servers concurrently or in separate terminals:

**Terminal 1 — Backend API Server (Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend Client (Port 5173):**
```bash
cd frontend
npm run dev
```

Open your browser to:
👉 **`http://localhost:5173`**

---

## 7. Database Setup & Migrations

ClimateShield includes a dual-database architecture:
1. **Zero-Setup Local Database (Default)**: Runs out of the box using `backend/data/climateshield-db.json`. It automatically seeds an initial demo officer account (`demo@climateshield.org` / `climate123`) with historical assessment points and sample alerts.
2. **PostgreSQL Production Mode**: When connecting to a live PostgreSQL cluster, apply the migration file:
```bash
psql -h localhost -U postgres -d climateshield -f database/schema/migrations/001_initial_schema.sql
```
Then set in `backend/.env`:
```ini
DATABASE_URL=postgresql://postgres:password@localhost:5432/climateshield
USE_LOCAL_DB=false
```

---

## 8. Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend HTTP Port | `5000` |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |
| `JWT_SECRET` | Secret key used to sign session JWTs | `climateshield-super-secret-jwt-key-2026` |
| `CORS_ORIGIN` | Allowed origin for CORS | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string | `""` |
| `USE_LOCAL_DB` | Flag to use local file-backed persistence | `true` |
| `DEMO_MODE` | Force mock/demo data over live APIs | `false` |
| `MONITORING_INTERVAL_CRON` | Cron schedule for background monitoring | `0 */6 * * *` |
| `MONITORING_AUTO_START` | Automatically start monitoring on boot | `true` |
| `OPENWEATHER_API_KEY` | Optional external API key | `""` |
| `GEOCODING_API_KEY` | Optional geocoding provider key | `""` |

---

## 9. REST API Documentation

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `userType`, optional `cropType`, `farmArea`).
* `POST /api/auth/login` — Sign in and obtain JWT token.
* `POST /api/auth/logout` — Invalidate session.
* `GET  /api/auth/me` — Retrieve active authenticated session and primary location.
* `POST /api/auth/forgot-password` — Dispatch password reset instructions.

### Monitored Locations (`/api/locations`)
* `GET  /api/locations/search?q={query}` — Search worldwide locations using Open-Meteo Geocoding.
* `GET  /api/locations/details?lat={lat}&lon={lon}` — Reverse geocode coordinates to place details.
* `POST /api/locations` — Save a location for the authenticated user.
* `GET  /api/locations` — List all saved locations for the authenticated user.
* `GET  /api/locations/primary` — Get user's primary monitored location.
* `PUT  /api/locations/primary` — Update primary monitored location.

### Climate Risk Intelligence (`/api/risk`)
* `GET  /api/dashboard` — Generate comprehensive risk assessment for user's primary location.
* `POST /api/risk/analyze` — Ad-hoc risk analysis for arbitrary coordinates (`latitude`, `longitude`, `userType`).
* `POST /api/risk/scenario` — What-if simulation calculating deltas for `temperatureChange`, `rainfallChange`, `humidityChange`.
* `GET  /api/risk/history?days={7|30|90}` — Fetch historical assessment points for longitudinal charting.
* `GET  /api/risk/location/:id` — Risk assessment for a specific saved location.

### Weather Telemetry (`/api/weather`)
* `GET  /api/weather/current?lat={lat}&lon={lon}` — Raw current temperature, humidity, wind, UV.
* `GET  /api/weather/forecast?lat={lat}&lon={lon}` — 7-day daily forecast summaries.

### Alerts & Bulletins (`/api/alerts`)
* `GET   /api/alerts` — Fetch all alerts for the authenticated user.
* `GET   /api/alerts/:id` — Retrieve full alert details.
* `PATCH /api/alerts/:id/read` — Mark an alert as read.

### Profile & Settings (`/api/profile` & `/api/settings`)
* `GET  /api/profile` — Fetch user profile attributes.
* `PUT  /api/profile` — Update name, user type, and agricultural properties.
* `POST /api/profile/change-password` — Authenticated password update.
* `GET  /api/settings/notifications` — Retrieve notification settings.
* `PUT  /api/settings/notifications` — Update hazard subscriptions and delivery channels.

### Automated Monitoring (`/api/monitor`)
* `POST /api/monitor/run` — Manually trigger background monitoring scan cycle across all registered locations.

---

## 10. Demo Mode vs. Live Sensors

ClimateShield enforces clean separation between mock/demo data and real external sensor measurements:
* **Live Sensor Mode (Default)**: Connects to **Open-Meteo Reanalysis APIs** (completely free, open, and keyless) to retrieve real-time surface temperatures, relative humidity, precipitation, Digital Elevation Models, and volumetric soil moisture.
* **Demo Mode**: Can be toggled via `DEMO_MODE=true` in `backend/.env` or dynamically toggled via the **Demo Mode Pill** in the top navigation bar. When active:
  * A clear visual banner states: `DEMO MODE ACTIVE: Environmental services are using deterministic mock/simulation data repositories.`
  * Telemetry source badges display `DEMO / MOCK ENVIRONMENTAL DATA`.
  * Pre-seeded cities (e.g. Bhopal, Indore, Delhi, Phoenix) provide predictable responses even when offline.

---

## 11. Progressive Data Source Integration Guide

ClimateShield is engineered with a **Modular Environmental Data Layer**. Each sensor source resides in an isolated service in `backend/src/services/`. You can connect enterprise or satellite feeds without refactoring any risk engine calculations or frontend components:

1. **Weather Feeds (`weatherService.ts`)**:
   * Replace Open-Meteo with OpenWeatherMap OneCall or NOAA GFS by editing the `getCurrent()` and `getForecast()` methods.
2. **Satellite Vegetation / NDVI (`vegetationService.ts`)**:
   * Ingest Copernicus Sentinel-2 Level-2A imagery or Google Earth Engine NDVI assets by updating `getVegetationData()`.
3. **Soil Moisture (`soilMoistureService.ts`)**:
   * Ingest NASA SMAP (Soil Moisture Active Passive) or ESA CCI Soil Moisture by adapting `getSoilMoisture()`.
4. **Elevation & Terrain (`geospatialService.ts`)**:
   * Ingest USGS 3DEP or Copernicus 30m Global DEM by modifying `getElevation()`.
5. **Notification Providers (`notificationService.ts`)**:
   * Connect Twilio for SMS and SendGrid / AWS SES for automated email dispatches inside `sendNotification()`.

---

## 12. Transparent Environmental Risk Engine

The risk engine in `backend/src/services/riskService.ts` implements a rule-based physical model:
* **Heat Stress Index (0–100)**:
  $$\text{Heat Index} = f(\text{Ambient Temp}, \text{Relative Humidity})$$
  Evaluated alongside Land Surface Temperature (LST) and solar flux ($W/m^2$).
* **Drought Deficit Index (0–100)**:
  Calculated from 7-day precipitation anomaly (deviation from historical baseline), volumetric soil moisture ($m^3/m^3$), consecutive dry days, and NDVI canopy health.
* **Flood Inundation Index (0–100)**:
  Evaluates 24-hour rainfall accumulation ($mm$) weighed against ground saturation percentage and topographical basin classification derived from digital elevation data.
* **Composite Risk Score**:
  $$\text{Composite} = 0.65 \times \max(\text{Heat}, \text{Drought}, \text{Flood}) + 0.35 \times \text{Average}(\text{Heat}, \text{Drought}, \text{Flood})$$

---

## 13. Future Roadmap

* [ ] Machine Learning hybrid risk models trained on historical disaster event logs (EM-DAT).
* [ ] Multi-location saved portfolios for agricultural cooperatives and municipal disaster managers.
* [ ] WebPush notifications with offline PWA service worker caching.
* [ ] High-resolution satellite tile overlay layers directly on Leaflet (NASA GIBS / Sentinel Hub).
* [ ] Multilingual localization (Hindi, Spanish, French, Swahili).

---

## 🛡️ License

MIT License. Developed for resilient, proactive climate risk intelligence.

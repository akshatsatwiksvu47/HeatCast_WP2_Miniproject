# HeatCast

### Climate Intelligence for Heatwave Monitoring, Prediction, and Early Warning

HeatCast is a climate intelligence platform designed to help monitor heat conditions, understand regional heatwave risk, identify hotspots, and communicate actionable warnings.

The project is being developed as a **Web Programming II (WP2) mini-project** based on the use case:

> **Climate Intelligence for Heatwave Monitoring, Prediction, and Early Warning**

The current implementation focuses on building a polished, responsive **frontend dashboard and user interface**. Backend integration, real datasets, and AI/ML-based prediction are planned for later stages of development.

---

## Current Project Status

### Frontend Phase — Completed

The current version provides the complete frontend structure and visual interface for the platform.

Implemented areas include:

- Dashboard
- Regional monitoring
- Temperature trends
- Heat risk assessment
- Heatwave probability
- Hotspot visualization interface
- Forecast interface
- Alerts and advisories
- Stakeholder-specific advisory interface
- About / project information page
- Responsive layouts
- Reusable React components
- API service structure for future backend integration

The current frontend uses prototype/sample data where real backend or ML output is not yet available.

---

# Features

## 📊 Dashboard

The dashboard provides an overview of current heat conditions and regional risk.

It includes:

- Current heat indicators
- Regional conditions
- Temperature trends
- Heat risk assessment
- Heatwave probability
- Risk explanations
- Active warnings
- Stakeholder-specific advisories

The dashboard is designed to provide important information quickly without overwhelming the user.

---

## 🌡️ Regional Monitoring

The Monitoring section provides a regional view of heat conditions.

Users can view information such as:

- Region
- State
- Current temperature
- Normal temperature
- Temperature departure
- Heatwave risk
- Severity
- Current status

Regional information is displayed through a structured data table.

---

## 📈 Temperature Trends

HeatCast provides a temperature trend interface for observing recent temperature conditions.

The current frontend supports:

- Temperature trend visualization
- Column chart representation
- Line chart representation
- Recent observation labels
- Normal temperature reference
- Interactive chart elements

The chart structure is designed so that real observation data can later be supplied by the backend.

---

## 🔥 Heat Risk Assessment

The frontend includes a composite **Heat Risk Score** interface.

The current prototype considers multiple heat indicators including:

- Current temperature
- Temperature anomaly
- Humidity
- Heatwave severity
- Risk classification

The score is currently calculated on the frontend as a prototype.

> The prototype scoring logic is intended to be replaced by validated backend or ML-generated risk output in the future.

---

## ⚠️ Heatwave Probability

HeatCast includes an early-warning probability interface that communicates the estimated likelihood of heatwave conditions.

The current prototype considers:

- Temperature anomaly
- Temperature conditions
- Humidity
- Severity
- Risk classification
- Confidence indicators

The probability calculation is currently a frontend prototype and will eventually be supplied by the prediction system.

---

## 🧠 Explainable Risk

The Risk Explanation component provides a human-readable breakdown of why a region may currently be considered at risk.

It considers factors such as:

- Temperature anomaly
- Maximum temperature
- Humidity
- Minimum temperature
- Heatwave severity
- Risk classification

This is intended to make the system more understandable instead of presenting users with a risk score without context.

---

## 🚨 Alerts & Advisories

The Alerts section communicates active heatwave warnings and advisory information.

The interface supports:

- Warning severity
- Region information
- Expected temperature
- Validity information
- Advisory content
- Stakeholder-specific guidance

Stakeholder categories currently include:

- Citizen
- Farmer
- Health Department
- Local Authority

---

## 👥 Stakeholder-Specific Guidance

HeatCast is designed for multiple groups that may respond differently to extreme heat.

### Citizen

Provides practical information for staying safe during elevated heat conditions.

### Farmer

Provides information related to crops, livestock, and field activities.

### Health Department

Supports healthcare facility readiness and public-health response.

### Local Authority

Supports coordinated local heat-action measures and communication.

---

# Application Structure

The application is organized into reusable React components and page-level layouts.

```text
HeatCast/
│
├── src/
│   │
│   ├── components/
│   │   ├── AlertList/
│   │   ├── DateSelector/
│   │   ├── ForecastList/
│   │   ├── HeatRiskCard/
│   │   ├── HeatwaveProbability/
│   │   ├── Navbar/
│   │   ├── RegionalTable/
│   │   ├── RiskExplanation/
│   │   ├── SeverityBadge/
│   │   ├── StakeholderAdvisory/
│   │   ├── StatCard/
│   │   └── TemperatureChart/
│   │
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Monitoring/
│   │   ├── Forecast/
│   │   ├── Hotspots/
│   │   ├── Alerts/
│   │   └── About/
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── App.jsx
│   └── App.css
│
├── public/
│
├── package.json
├── package-lock.json
└── README.md

# HeatCast

### Climate Intelligence for Heatwave Monitoring, Prediction, and Early Warning

HeatCast is a climate intelligence platform designed to help monitor heat conditions, understand regional heatwave risk, identify hotspots, provide forecasts, and communicate actionable warnings.

The project is being developed as a **Web Programming II (WP2) mini-project** based on the use case:

> **Climate Intelligence for Heatwave Monitoring, Prediction, and Early Warning**

The current implementation focuses on building a polished, responsive **React frontend and user interface**. The frontend is structured to support future integration with real climate datasets, backend services, and machine-learning prediction models.

---

# Current Project Status

## Frontend Phase — Completed

The current version provides the main frontend structure, reusable React components, responsive layouts, navigation, data-service layer, and interactive climate intelligence interfaces.

Implemented areas include:

- Dashboard
- Regional monitoring
- Temperature trend visualization
- Heat risk assessment
- Heatwave probability
- Risk explanation
- Regional comparison
- Heatwave forecast
- Hotspot visualization
- Alerts and warnings
- Stakeholder-specific advisories
- AI heatwave prediction interface
- About / project information page
- Responsive layouts
- Reusable React components
- JSON-based prototype data services
- Fetch API integration
- Promise-based asynchronous data retrieval
- Async/await
- React state and effect management

The current frontend uses structured prototype data where real backend services and machine-learning outputs are not yet available.

---

# Features

## 📊 Dashboard

The Dashboard provides an overview of current heat conditions and regional risk.

It includes:

- Current climate indicators
- Regional conditions
- Temperature trends
- Heat risk assessment
- Heatwave probability
- Explainable risk information
- Active warnings
- Stakeholder-specific advisories

The dashboard is designed to present important climate information quickly while maintaining a clear and organized interface.

---

## 🌡️ Regional Monitoring

The Monitoring section provides a structured regional view of heat conditions.

Users can view information such as:

- Region
- Current temperature
- Normal temperature
- Temperature departure
- Heatwave risk
- Severity
- Current status

Regional information is presented using the reusable **RegionalTable** component.

---

## 📈 Temperature Trends

HeatCast provides an interactive temperature trend interface for observing recent temperature conditions.

The frontend supports:

- Temperature trend visualization
- Column chart representation
- Line chart representation
- Recent observation labels
- Normal temperature reference
- Interactive chart elements
- Chart type selection

The temperature chart is implemented as a reusable **TemperatureChart** component.

The current chart uses structured frontend data and is designed to accept real observation data in future backend integration.

---

## 🔥 Heat Risk Assessment

HeatCast includes a composite **Heat Risk Score** interface.

The frontend considers multiple climate indicators, including:

- Temperature
- Temperature departure
- Humidity
- Heatwave probability
- Risk classification
- Severity

The **HeatRiskCard** component presents the resulting risk information in a visually understandable format.

The current scoring and classification are prototype implementations and are intended to be replaced or enhanced with validated backend or ML-generated risk outputs in future development.

---

## ⚠️ Heatwave Probability

The **HeatwaveProbability** component provides a visual representation of the estimated likelihood of heatwave conditions.

The prototype considers information such as:

- Temperature conditions
- Temperature departure
- Humidity
- Heatwave risk
- Severity
- Confidence indicators

The current probability values are structured prototype data. Future versions can receive prediction results from a trained machine-learning model.

---

## 🧠 Explainable Risk

The **RiskExplanation** component provides a human-readable explanation of the factors contributing to a region's heat risk.

The interface can present factors such as:

- Temperature anomaly
- Maximum temperature
- Humidity
- Minimum temperature
- Heatwave severity
- Risk classification

This helps users understand the reasoning behind a risk classification instead of receiving only a numerical score.

---

## 🔮 Heatwave Forecast

The Forecast section provides an interface for viewing upcoming temperature and heatwave conditions.

It supports:

- Forecast information
- Predicted temperature conditions
- Expected heatwave severity
- Forecast visualization
- Regional forecast selection

The forecast interface is designed to support future integration with real forecasting services and prediction models.

---

## 🗺️ Heatwave Hotspots

The Hotspots section provides a visual interface for identifying regions experiencing elevated heat conditions.

The frontend includes a hotspot visualization structure designed to represent:

- High-risk regions
- Regional heat concentration
- Heat intensity
- Geographic distribution of heat conditions

The current hotspot information uses prototype data and can later be connected to real geospatial climate datasets.

---

## 🚨 Alerts & Early Warnings

The Alerts section communicates active heatwave warnings and advisory information.

The interface supports:

- Warning severity
- Region information
- Expected temperature
- Warning validity
- Alert information
- Advisory content

Severity information is visually represented using the reusable **SeverityBadge** component.

The alert interface is designed to support future real-time warning data.

---

## 👥 Stakeholder-Specific Advisories

HeatCast provides targeted guidance for different stakeholders who may respond differently to extreme heat.

The **StakeholderAdvisory** component supports information for:

### Citizen

Provides practical guidance for staying safe during elevated heat conditions.

### Farmer

Provides information related to crops, livestock, and outdoor agricultural activities.

### Health Department

Supports healthcare preparedness and public-health response during heatwave conditions.

### Local Authority

Supports coordinated heat-action measures, public communication, and local response planning.

---

# 🤖 AI Heatwave Prediction

The AI Prediction page provides the frontend interface for the future machine-learning prediction layer of HeatCast.

Users can select a region and view prediction information including:

- Predicted heatwave probability
- Prediction likelihood
- Prediction confidence
- Prediction time horizon
- Predicted temperature
- Expected temperature departure
- Risk level
- Severity
- Prediction factors

The probability indicator changes its visual severity according to the prediction classification:

- **Low** — Green
- **Moderate** — Yellow
- **High** — Orange
- **Severe** — Red
- **Extreme** — Deep Red

The current implementation uses structured regional climate data to create a **prototype prediction interface**.

The architecture is intentionally designed so that the prototype data can later be replaced with predictions generated by a trained machine-learning model through a backend API.

---

# 🌐 API / Data Service Layer

HeatCast includes a frontend service layer in:

```text
src/services/api.js

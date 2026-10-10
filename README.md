# HeatCast 🔥
### Climate Intelligence for Heatwave Monitoring, Prediction, and Early Warning

HeatCast is a climate intelligence platform developed as a **Web Programming II (WP2) mini-project**. It helps users monitor regional heat conditions, assess heatwave risk, explore forecasts, identify hotspots, and access heat-related alerts and stakeholder advisories.

The project combines a **React frontend, Node.js/Express backend, MongoDB database, and live weather API integration** to provide an interactive climate-monitoring experience.

> **Use Case:** Climate Intelligence for Heatwave Monitoring, Prediction, and Early Warning

## ✨ Key Features

- **Dashboard:** Overview of regional temperatures, heat risk, trends, and warnings.
- **Regional Monitoring:** View current temperatures, temperature departures, risk levels, and regional conditions.
- **Temperature Trends:** Visualize temperature observations and compare them with reference values.
- **Dynamic Heat-Risk Assessment:** Calculate risk categories using shared rule-based classification logic.
- **Heatwave Forecast:** Explore forecast temperatures and expected heat conditions.
- **Hotspot Visualization:** Identify regions with elevated heat risk.
- **Alerts & Early Warnings:** Present heat-related alerts and relevant advisory information.
- **Stakeholder Advisories:** Provide guidance for citizens, farmers, health departments, and local authorities.
- **AI Prediction Interface:** Display prediction-style indicators and risk explanations through the frontend.
- **Responsive UI:** Reusable React components and responsive layouts.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Weather Data | Open-Meteo API |
| Data Communication | REST APIs, Fetch API, JSON |
| Development Tools | Git, GitHub, VS Code |

## 🏗️ Project Structure

```text
HeatCast_WP2_Miniproject/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── .gitignore
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── utils/
├── public/
│   └── data/
├── index.html
├── package.json
└── README.md
```

*The structure above summarizes the main project directories; individual files may vary.*

## 🌐 Backend and Data Flow

The Express backend connects the frontend with weather data and database services.

1. The backend retrieves weather information from the configured weather API.
2. Weather observations are stored and refreshed in MongoDB.
3. REST endpoints expose the available weather data to the frontend.
4. The React application retrieves data through its service layer.
5. Shared JavaScript logic calculates heat-risk categories for relevant interfaces.
6. The UI presents regional conditions, forecasts, hotspots, and alerts.

The backend uses a scheduled weather-refresh process. The refresh interval depends on the backend configuration, while the frontend can request the latest stored data independently.

## 🧠 Heat-Risk Assessment and Prediction

HeatCast includes rule-based heat-risk classification using temperature-related indicators and temperature departures, with additional humidity handling where applicable.

The shared classification logic helps maintain consistency across major interfaces, including the Dashboard, Monitoring, Forecast, and Hotspots.

**Important:** The current implementation uses JavaScript rules rather than a trained machine-learning model. The AI Prediction page provides a prediction-oriented interface, but its values should not be interpreted as outputs from a trained ML model unless one is integrated separately.

Risk categories are intended for project demonstration and are not a replacement for official meteorological warnings.

## 🚀 Getting Started

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) — preferably the current LTS release
- [Git](https://git-scm.com/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community), if using a local database

### 1. Clone the Repository

```bash
git clone https://github.com/akshatsatwiksvu47/HeatCast_WP2_Miniproject.git
cd HeatCast_WP2_Miniproject
```

### 2. Install Frontend Dependencies

Run from the repository root:

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `backend/.env` file containing the environment variables required by `backend/server.js`.

Configure the MongoDB connection string and any other required settings according to the backend implementation. Ensure MongoDB is running and accessible.

**Never commit `.env` files, passwords, or database credentials to GitHub.**

### 5. Start the Backend

From the `backend` directory, use the development script defined in `backend/package.json`, if available:

```bash
npm run dev
```

If the project defines only a start script, use:

```bash
npm start
```

Keep the backend terminal running.

### 6. Start the Frontend

Open a second terminal at the repository root:

```bash
npm run dev
```

Open the local URL printed by Vite, typically:

```text
http://localhost:5173
```

Make sure the frontend's configured API URL matches the address and port used by the backend.

## 📡 API and Data Services

The frontend service layer is located in:

```text
src/services/api.js
```

Weather retrieval and related API functionality are organized in the frontend service layer, while Express routes and services are maintained under `backend/`.

The frontend communicates with the backend through HTTP requests and JSON responses. Exact endpoint paths and available operations are defined by the current backend implementation.

## 🔒 Security and Configuration

- Environment variables are stored locally in `.env`.
- Dependencies are installed separately for the frontend and backend.
- MongoDB must be configured and accessible before database-dependent features can operate.
- API URLs and ports must match the local configuration.
- Credentials and other secrets must never be committed to the repository.

## 🎯 Project Scope

HeatCast demonstrates full-stack web development concepts through a climate-monitoring use case, including:

- Component-based React development
- Asynchronous API requests and JSON data handling
- REST API development using Express
- MongoDB integration
- Scheduled data retrieval and storage
- Dynamic rule-based risk classification
- Data visualization and responsive UI design

The architecture can be extended in the future with validated meteorological datasets, trained machine-learning models, improved forecasting, and additional early-warning capabilities.

## 👨‍💻 Development

Contributions and improvements can be made through Git branches and pull requests. Before committing, verify that generated dependencies, build output, and environment secrets are excluded from version control.

## 📄 License

No license has been specified for this project. Contact the repository owner before redistributing or reusing the code outside the intended project scope.

---

**HeatCast — Turning weather data into actionable heat-risk insights.**

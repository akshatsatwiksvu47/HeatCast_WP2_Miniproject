
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";

import regionRoutes from "./routes/regionRoutes.js";
import { refreshWeatherData } from "./services/weatherService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

let refreshStatus = {
  running: false,
  lastAttemptAt: null,
  lastSuccessAt: null,
  lastUpdatedAt: null,
  lastError: null,
  lastResult: null
};

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Backend health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HeatCast Backend API is running!",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
    weatherRefresh: refreshStatus
  });
});

// Existing regions API
app.use("/api/regions", regionRoutes);

// Get weather records from MongoDB
app.get("/api/weather", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "MongoDB is not connected."
      });
    }

    const data = await mongoose.connection.db
      .collection("liveweather")
      .find({})
      .sort({ region: 1 })
      .toArray();

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error("Weather retrieval failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve weather data."
    });
  }
});

// Shared refresh function
async function runWeatherRefresh(source = "manual") {
  if (refreshStatus.running) {
    return {
      success: false,
      alreadyRunning: true,
      message: "A weather refresh is already running.",
      status: refreshStatus
    };
  }

  refreshStatus.running = true;
  refreshStatus.lastAttemptAt = new Date().toISOString();
  refreshStatus.lastError = null;

  console.log(`[Weather] ${source} refresh started.`);

  try {
    const result = await refreshWeatherData();

    const updated = Number(result?.updated ?? 0);
    const failed = Number(result?.failed ?? 0);

    refreshStatus.lastResult = result;

    if (updated > 0) {
      refreshStatus.lastUpdatedAt = new Date().toISOString();
    }

    if (result?.success === true && failed === 0) {
      refreshStatus.lastSuccessAt = new Date().toISOString();
      refreshStatus.lastError = null;
    } else {
      refreshStatus.lastError =
        result?.errors?.length
          ? result.errors
              .map((item) => `${item.region}: ${item.error}`)
              .join("; ")
          : result?.message || "Refresh completed with errors.";

      console.warn(
        `[Weather] ${source} refresh partially failed.`,
        refreshStatus.lastError
      );
    }

    console.log(
      `[Weather] ${source} refresh finished: ` +
      `${updated} updated, ${failed} failed.`
    );

    return {
      ...result,
      source,
      status: { ...refreshStatus }
    };
  } catch (error) {
    refreshStatus.lastError = error.message;

    console.error(
      `[Weather] ${source} refresh failed:`,
      error.message
    );

    throw error;
  } finally {
    refreshStatus.running = false;
  }
}

// Manually trigger a weather refresh
app.post("/api/weather/refresh", async (req, res) => {
  try {
    const result = await runWeatherRefresh("manual");

    if (result.alreadyRunning) {
      return res.status(409).json(result);
    }

    res.status(result.success ? 200 : 207).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      status: refreshStatus
    });
  }
});

// Per-region timestamps and overall refresh status
app.get("/api/weather/status", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "MongoDB is not connected.",
        status: refreshStatus
      });
    }

    const data = await mongoose.connection.db
      .collection("liveweather")
      .find({})
      .project({
        _id: 0,
        region: 1,
        source: 1,
        sourceUpdatedAt: 1,
        refreshedAt: 1
      })
      .sort({ region: 1 })
      .toArray();

    res.json({
      success: true,
      count: data.length,
      data,
      status: { ...refreshStatus }
    });
  } catch (error) {
    console.error("Weather status retrieval failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve weather status.",
      status: refreshStatus
    });
  }
});

// Unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// General error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// Start backend
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`HeatCast backend running at http://localhost:${PORT}`);
      console.log(`Regions API: http://localhost:${PORT}/api/regions`);
      console.log(`Weather API: http://localhost:${PORT}/api/weather`);
      console.log(`Weather status: http://localhost:${PORT}/api/weather/status`);
      console.log("Manual refresh: POST /api/weather/refresh");

      // Immediate refresh on startup
      runWeatherRefresh("startup").catch((error) => {
        console.error("Startup refresh failed:", error.message);
      });

      // Automatic refresh every hour at minute 0
      cron.schedule("0 * * * *", async () => {
        try {
          await runWeatherRefresh("scheduled");
        } catch (error) {
          console.error("Scheduled refresh failed:", error.message);
        }
      });

      console.log("Hourly weather refresh scheduler enabled.");
    });
  } catch (error) {
    console.error("Failed to start HeatCast backend:", error.message);
    process.exit(1);
  }
}

startServer();

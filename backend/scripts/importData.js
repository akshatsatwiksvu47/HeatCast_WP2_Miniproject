import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(
  __dirname,
  "../../HeatCast/public/data"
);

const readJSON = (filename) => {
  const filePath = path.join(DATA_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`JSON file not found: ${filePath}`);
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

const importCollection = async (name, documents) => {
  const collection = mongoose.connection.db.collection(name);

  // Replace only this collection's existing imported data.
  await collection.deleteMany({});

  if (documents.length > 0) {
    await collection.insertMany(documents);
  }

  console.log(`Imported ${documents.length} records into ${name}`);
};

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");
    console.log(`Reading JSON files from: ${DATA_DIR}`);

    const advisoriesData = readJSON("advisories.json");
    const alertsData = readJSON("alerts.json");
    const dashboardData = readJSON("dashboard.json");
    const forecastsData = readJSON("forecasts.json");
    const hotspotsData = readJSON("hotspots.json");
    const locationsData = readJSON("locations.json");
    const regionsData = readJSON("regions.json");
    const temperatureData = readJSON("temperature.json");

    const advisories = Object.entries(advisoriesData).map(
      ([stakeholder, recommendations]) => ({
        stakeholder,
        recommendations
      })
    );

    const forecasts = Object.entries(forecastsData).map(
      ([region, forecast]) => ({
        region,
        forecast
      })
    );

    const temperatures = Object.entries(temperatureData).map(
      ([region, data]) => ({
        region,
        ...data
      })
    );

    await importCollection("advisories", advisories);
    await importCollection("alerts", alertsData);
    await importCollection("dashboard", [
      { key: "main", ...dashboardData }
    ]);
    await importCollection("forecasts", forecasts);
    await importCollection("hotspots", hotspotsData);
    await importCollection("locations", locationsData);
    await importCollection("regions", regionsData);
    await importCollection("temperatures", temperatures);

    console.log("\nAll 8 HeatCast JSON files imported successfully!");
    console.log("Database: heatcast");
  } catch (error) {
    console.error("\nImport failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

importData();
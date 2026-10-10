
import express from "express";
import mongoose from "mongoose";
import Region from "../models/Region.js";

const router = express.Router();

// Helper: attach the latest stored weather to a region
async function attachLiveWeather(regions) {
  const db = mongoose.connection.db;

  if (!db || regions.length === 0) {
    return regions.map((region) => ({
      ...region.toObject(),
      liveWeather: null
    }));
  }

  const weatherRecords = await db
    .collection("liveweather")
    .find({})
    .toArray();

  const weatherByName = new Map(
    weatherRecords.map((weather) => [
      String(weather.region).trim().toLowerCase(),
      weather
    ])
  );

  return regions.map((region) => {
    const regionData = region.toObject();

    const name = String(regionData.name || "")
      .trim()
      .toLowerCase();

    return {
      ...regionData,
      liveWeather: weatherByName.get(name) || null
    };
  });
}

// GET all regions, including live weather
router.get("/", async (req, res) => {
  try {
    const regions = await Region.find().sort({ name: 1 });
    const data = await attachLiveWeather(regions);

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error("Get regions failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve regions."
    });
  }
});

// GET one region by MongoDB ID or custom region ID
router.get("/:id", async (req, res) => {
  try {
    const region = mongoose.isValidObjectId(req.params.id)
      ? await Region.findById(req.params.id)
      : await Region.findOne({ id: req.params.id });

    if (!region) {
      return res.status(404).json({
        success: false,
        message: "Region not found."
      });
    }

    const [data] = await attachLiveWeather([region]);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Get region failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve region."
    });
  }
});

// CREATE region
router.post("/", async (req, res) => {
  try {
    const region = await Region.create(req.body);

    res.status(201).json({
      success: true,
      message: "Region created successfully.",
      data: region
    });
  } catch (error) {
    const isClientError =
      error.name === "ValidationError" ||
      error.code === 11000;

    res.status(isClientError ? 400 : 500).json({
      success: false,
      message:
        error.code === 11000
          ? "Region ID already exists."
          : error.message
    });
  }
});

// UPDATE region
router.put("/:id", async (req, res) => {
  try {
    const filter = mongoose.isValidObjectId(req.params.id)
      ? { _id: req.params.id }
      : { id: req.params.id };

    const region = await Region.findOneAndUpdate(
      filter,
      req.body,
      {
        new: true,
        runValidators: true,
        strict: true
      }
    );

    if (!region) {
      return res.status(404).json({
        success: false,
        message: "Region not found."
      });
    }

    res.json({
      success: true,
      message: "Region updated successfully.",
      data: region
    });
  } catch (error) {
    const isClientError =
      error.name === "ValidationError" ||
      error.code === 11000;

    res.status(isClientError ? 400 : 500).json({
      success: false,
      message:
        error.code === 11000
          ? "Region ID already exists."
          : error.message
    });
  }
});

// DELETE region
router.delete("/:id", async (req, res) => {
  try {
    const filter = mongoose.isValidObjectId(req.params.id)
      ? { _id: req.params.id }
      : { id: req.params.id };

    const region = await Region.findOneAndDelete(filter);

    if (!region) {
      return res.status(404).json({
        success: false,
        message: "Region not found."
      });
    }

    res.json({
      success: true,
      message: "Region deleted successfully.",
      data: region
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete region."
    });
  }
});

export default router;

import mongoose from "mongoose";

const regionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    temperature: { type: Number, required: true },
    normal: { type: Number, required: true },
    departure: { type: Number, required: true },
    minTemp: { type: Number, required: true },
    humidity: { type: Number, required: true, min: 0, max: 100 },
    status: { type: String, required: true },
    severity: { type: String, required: true },
    risk: { type: String, required: true },
    trend: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: false
  }
);

const Region = mongoose.model("Region", regionSchema, "regions");

export default Region;
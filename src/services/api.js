async function fetchJSON(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return response.json();
}


/* =========================================
   DASHBOARD
========================================= */

export function getDashboard() {
  return fetchJSON("/data/dashboard.json");
}


/* =========================================
   REGIONS
========================================= */

export function getRegions() {
  return fetchJSON("/data/regions.json");
}


/* =========================================
   TEMPERATURE DATA
========================================= */

export async function getTemperatureData(regionName) {
  const data = await fetchJSON("/data/temperature.json");

  /*
    Supported structure 1:

    {
      "Delhi NCR": {
        "labels": [...],
        "temperatures": [...],
        "normalTemperature": 39.8
      },

      "Jaipur": {
        ...
      }
    }
  */

  if (
    data &&
    !Array.isArray(data) &&
    regionName &&
    data[regionName]
  ) {
    return data[regionName];
  }


  /*
    Supported structure 2:

    {
      "regions": {
        "Delhi NCR": {...},
        "Jaipur": {...}
      }
    }
  */

  if (
    data &&
    data.regions &&
    regionName &&
    data.regions[regionName]
  ) {
    return data.regions[regionName];
  }


  /*
    Supported structure 3:

    [
      {
        "region": "Delhi NCR",
        "labels": [...],
        "temperatures": [...]
      },
      ...
    ]
  */

  if (Array.isArray(data)) {
    const regionData = data.find(
      (item) =>
        item.region === regionName ||
        item.name === regionName
    );

    if (regionData) {
      return regionData;
    }

    /*
      If there is only one dataset,
      use it as fallback.
    */

    if (data.length > 0) {
      return data[0];
    }
  }


  /*
    Backwards compatibility:

    If temperature.json itself is already
    a single temperature object.
  */

  if (
    data &&
    Array.isArray(data.temperatures)
  ) {
    return data;
  }


  throw new Error(
    `Temperature data not found for ${regionName}`
  );
}


/* =========================================
   FORECASTS
========================================= */

export async function getForecasts(regionName) {
  const data = await fetchJSON("/data/forecasts.json");

  /*
    Region-keyed structure
  */

  if (
    data &&
    !Array.isArray(data) &&
    regionName &&
    data[regionName]
  ) {
    return data[regionName];
  }


  /*
    Nested regions structure
  */

  if (
    data &&
    data.regions &&
    regionName &&
    data.regions[regionName]
  ) {
    return data.regions[regionName];
  }


  /*
    Array structure
  */

  if (Array.isArray(data)) {

    const regionData = data.find(
      (item) =>
        item.region === regionName ||
        item.name === regionName
    );

    if (regionData) {
      return regionData.forecasts || regionData;
    }

    return data;
  }


  /*
    Backwards compatibility
  */

  if (
    data &&
    Array.isArray(data.forecasts)
  ) {
    return data.forecasts;
  }


  return [];
}


/* =========================================
   ALERTS
========================================= */

export function getAlerts() {
  return fetchJSON("/data/alerts.json");
}


/* =========================================
   HOTSPOTS
========================================= */

export function getHotspots() {
  return fetchJSON("/data/hotspots.json");
}


/* =========================================
   LOCATIONS
========================================= */

export function getLocations() {
  return fetchJSON("/data/locations.json");
}


/* =========================================
   ADVISORIES
========================================= */

export function getAdvisories() {
  return fetchJSON("/data/advisories.json");
}

/* =========================================
   AI PREDICTION
========================================= */

export async function getAIPrediction(regionName) {

  const regions = await getRegions();

  const region = regions.find(
    (item) => item.name === regionName
  );

  if (!region) {
    throw new Error(
      `Prediction data not found for ${regionName}`
    );
  }


  /* =========================================
     PROTOTYPE PREDICTION LOGIC

     Uses existing regional climate data
     to prepare the frontend prediction layer.
  ========================================= */

  const risk = String(
    region.risk || "Moderate"
  );

  const severity = String(
    region.severity || "Moderate"
  );

  const temperature =
    Number(region.temperature) || 0;

  const normal =
    Number(region.normal) || 0;

  const departure =
    Number(region.departure) || 0;


  /* Probability based on current
     prototype risk classification */

  let probability = 45;

  if (risk.toLowerCase() === "low") {
    probability = 28;
  }

  if (risk.toLowerCase() === "moderate") {
    probability = 48;
  }

  if (risk.toLowerCase() === "high") {
    probability = 72;
  }

  if (risk.toLowerCase() === "severe") {
    probability = 84;
  }

  if (risk.toLowerCase() === "extreme") {
    probability = 94;
  }


  /* Confidence */

  const confidence =
    Math.min(
      95,
      Math.max(
        70,
        76 + Math.abs(departure) * 2
      )
    );


  /* Prototype predicted temperature */

  const predictedTemperature =
    temperature > 0
      ? Number(
          (temperature + 0.8).toFixed(1)
        )
      : 0;


  /* Factor scores */

  const anomalyScore =
    Math.min(
      100,
      Math.max(
        15,
        50 + Math.abs(departure) * 8
      )
    );


  const temperatureScore =
    Math.min(
      100,
      Math.max(
        20,
        temperature > 40
          ? 90
          : temperature > 38
          ? 78
          : temperature > 35
          ? 62
          : 42
      )
    );


  const normalScore =
    normal > 0
      ? Math.min(
          100,
          Math.max(
            20,
            50 +
              Math.abs(
                temperature - normal
              ) * 8
          )
        )
      : 50;


  const departureScore =
    Math.min(
      100,
      Math.max(
        15,
        50 + Math.abs(departure) * 8
      )
    );


  let likelihood = "Moderate Likelihood";

  if (probability >= 80) {
    likelihood = "Very High Likelihood";
  } else if (probability >= 65) {
    likelihood = "High Likelihood";
  } else if (probability < 40) {
    likelihood = "Low Likelihood";
  }


  return {

    region: region.name,

    probability,

    likelihood,

    confidence: Math.round(confidence),

    horizon: "Next 24–48 Hours",

    predictedTemperature,

    departure: Number(
      departure.toFixed(1)
    ),

    risk,

    severity,

    insight:
      `${region.name} is currently showing ` +
      `${risk.toLowerCase()} heat risk with ` +
      `a temperature departure of ` +
      `${departure >= 0 ? "+" : ""}${departure.toFixed(1)}°C ` +
      `from the regional normal.`,


    factors: [

      {
        name: "Temperature Anomaly",

        value:
          `${departure >= 0 ? "+" : ""}` +
          `${departure.toFixed(1)}°C`,

        score: Math.round(
          anomalyScore
        ),

        description:
          "Difference between the current temperature and the regional normal."
      },


      {
        name: "Maximum Temperature",

        value:
          `${temperature.toFixed(1)}°C`,

        score: Math.round(
          temperatureScore
        ),

        description:
          "Current maximum temperature indicates the intensity of daytime heat."
      },


      {
        name: "Normal Temperature",

        value:
          `${normal.toFixed(1)}°C`,

        score: Math.round(
          normalScore
        ),

        description:
          "Regional normal temperature is used as the baseline for comparison."
      },


      {
        name: "Temperature Departure",

        value:
          `${departure >= 0 ? "+" : ""}` +
          `${departure.toFixed(1)}°C`,

        score: Math.round(
          departureScore
        ),

        description:
          "Higher positive departure indicates increased heatwave potential."
      }

    ]

  };
}
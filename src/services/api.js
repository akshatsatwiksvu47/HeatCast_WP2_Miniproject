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
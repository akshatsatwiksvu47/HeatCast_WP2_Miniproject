const API_BASE_URL = "http://localhost:5000/api";

async function request(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(
      `Weather API request failed: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Unable to fetch weather data.");
  }

  return result;
}

export async function getLiveWeather() {
  const result = await request("/weather");
  return result.data;
}

export async function getWeatherStatus() {
  const result = await request("/weather/status");
  return result.data;
}

export async function getLiveWeatherByRegion(regionName) {
  const weather = await getLiveWeather();

  const region = weather.find(
    (item) => item.region.toLowerCase() === regionName.toLowerCase()
  );

  if (!region) {
    throw new Error(`No live weather found for ${regionName}.`);
  }

  return region;
}
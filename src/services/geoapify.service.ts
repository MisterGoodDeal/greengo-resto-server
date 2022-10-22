const env = require("dotenv").config();
import fetch from "node-fetch";

const routePlanner = async (params: RoutePlannerParams) => {
  const PLANNER_API_KEY = env.parsed.GEOAPIFY_PLANNER_KEY;
  const response = await fetch(
    `https://api.geoapify.com/v1/routing?waypoints=${params.startLat},${params.startLng}|${params.endLat},${params.endLng}&mode=walk&apiKey=${PLANNER_API_KEY}`
  );
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("geoapify route planner error");
  }
};
export const geoapify = {
  planner: routePlanner,
};

interface RoutePlannerParams {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}

export interface RoutePlannerResponse {
  time: number;
  distance: number;
  polyline: { latitude: number; longitude: number }[];
}

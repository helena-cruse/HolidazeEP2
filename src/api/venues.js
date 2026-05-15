import { HOLIDAZE_API } from "../utils/constants";

export async function getVenues() {
  const response = await fetch(
    `${HOLIDAZE_API}/venues?_owner=true&_bookings=true&limit=50`
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors?.[0]?.message || "Failed to fetch venues");
  }

  return json.data;
}

export async function searchVenues(query) {
  const response = await fetch(
    `${HOLIDAZE_API}/venues/search?q=${encodeURIComponent(query)}`
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors?.[0]?.message || "Failed to search venues");
  }

  return json.data;
}

export async function getVenueById(id) {
  const response = await fetch(
    `${HOLIDAZE_API}/venues/${id}?_owner=true&_bookings=true`
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors?.[0]?.message || "Failed to fetch venue");
  }

  return json.data;
}

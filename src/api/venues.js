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

export async function createVenue(venueData, token, apiKey) {
  const response = await fetch(`${HOLIDAZE_API}/venues`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": apiKey,
    },
    body: JSON.stringify(venueData),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors?.[0]?.message || "Failed to create venue");
  }

  return json.data;
}

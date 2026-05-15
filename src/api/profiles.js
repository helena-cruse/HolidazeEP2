import { HOLIDAZE_API } from "../utils/constants";

export async function getProfileByName(name) {
  const response = await fetch(
    `${HOLIDAZE_API}/profiles/${name}?_venues=true&_bookings=true`
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors?.[0]?.message || "Failed to fetch profile");
  }

  return json.data;
}

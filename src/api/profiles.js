import { HOLIDAZE_API } from "../utils/constants";

export async function getProfile(name, token, apiKey) {
  const response = await fetch(
    `${HOLIDAZE_API}/profiles/${name}?_bookings=true&_venues=true`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    }
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return json.data;
}

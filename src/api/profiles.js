import { HOLIDAZE_API } from "../utils/constants";
import { load, save } from "../utils/storage";

export async function getProfileByName(name) {
  const user = load("user");
  const apiKey = load("apiKey");

  const response = await fetch(
    `${HOLIDAZE_API}/profiles/${name}?_bookings=true&_venues=true`,
    {
      headers: {
        Authorization: `Bearer ${user?.accessToken}`,
        "X-Noroff-API-Key": apiKey,
      },
    }
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors?.[0]?.message || "Failed to fetch profile");
  }

  return json.data;
}

export async function getProfileVenuesWithBookings(name) {
  const user = load("user");
  const apiKey = load("apiKey");

  const response = await fetch(
    `${HOLIDAZE_API}/profiles/${name}/venues?_bookings=true`,
    {
      headers: {
        Authorization: `Bearer ${user?.accessToken}`,
        "X-Noroff-API-Key": apiKey,
      },
    }
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors?.[0]?.message || "Failed to fetch host venues");
  }

  return json.data;
}

export async function updateProfile(name, profileData) {
  const user = load("user");
  const apiKey = load("apiKey");

  const response = await fetch(`${HOLIDAZE_API}/profiles/${name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user?.accessToken}`,
      "X-Noroff-API-Key": apiKey,
    },
    body: JSON.stringify(profileData),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors?.[0]?.message || "Failed to update profile");
  }

  const updatedUser = {
    ...user,
    bio: json.data.bio,
    avatar: json.data.avatar,
    banner: json.data.banner,
    venueManager: json.data.venueManager,
  };

  save("user", updatedUser);

  return json.data;
}

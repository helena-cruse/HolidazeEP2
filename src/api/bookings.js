import { HOLIDAZE_API } from "../utils/constants";

export async function createBooking(data, token, apiKey) {
  const response = await fetch(`${HOLIDAZE_API}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": apiKey,
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error("Booking failed");
  }

  return json.data;
}

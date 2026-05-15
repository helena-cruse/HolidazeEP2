import { AUTH_API } from "../utils/constants";
import { save } from "../utils/storage";

export async function registerUser(userData) {
  const response = await fetch(`${AUTH_API}/register?_holidaze=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors?.[0]?.message || "Registration failed");
  }

  return json.data;
}

export async function loginUser(userData) {
  const response = await fetch(`${AUTH_API}/login?_holidaze=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors?.[0]?.message || "Login failed");
  }

  save("user", json.data);

  return json.data;
}

export async function createApiKey(accessToken) {
  const response = await fetch(`${AUTH_API}/create-api-key`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Holidaze API Key",
    }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.errors?.[0]?.message || "Failed to create API key");
  }

  return json.data.key;
}

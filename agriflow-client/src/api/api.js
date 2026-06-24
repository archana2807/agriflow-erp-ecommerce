const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(url, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  };

  const res = await fetch(`${BASE_URL}${url}`, config);

  if (res.status === 401) {
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (url, params) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`${url}${query}`);
  },
  post: (url, body) => request(url, { method: "POST", body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: "PUT", body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: "DELETE" }),
};

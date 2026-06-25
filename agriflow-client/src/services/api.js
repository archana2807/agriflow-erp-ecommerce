async function apiFetch(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return data;
}

export function get(url) {
  return apiFetch(url, { method: "GET" });
}

export function post(url, data) {
  return apiFetch(url, { method: "POST", body: JSON.stringify(data) });
}

export function put(url, data) {
  return apiFetch(url, { method: "PUT", body: JSON.stringify(data) });
}

export function del(url) {
  return apiFetch(url, { method: "DELETE" });
}

export { apiFetch };

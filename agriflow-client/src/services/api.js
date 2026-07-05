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

  // try to parse JSON, but don't blow up if the body is empty (e.g. 204 responses)
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Request failed with status ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data;
}

export function get(url) {
  return apiFetch(url, { method: "GET" });
}

export function post(url, body) {
  return apiFetch(url, { method: "POST", body: JSON.stringify(body) });
}

export function put(url, body) {
  return apiFetch(url, { method: "PUT", body: JSON.stringify(body) });
}

export function del(url) {
  return apiFetch(url, { method: "DELETE" });
}

export { apiFetch };

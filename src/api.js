// Small fetch wrapper. All requests are relative (/api/...) and go through the
// Vite proxy. The session cookie is sent automatically with credentials: "include".

// The backend returns `detail` as a string OR as an array of validation errors.
function readError(data, status) {
  if (data && typeof data.detail === "string") return data.detail;
  if (data && Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        const field = item.loc ? item.loc.filter((p) => p !== "body").join(" → ") : "";
        return field ? `${field}: ${item.msg}` : item.msg;
      })
      .join("\n");
  }
  return `Request failed (${status})`;
}

export async function api(path, { method = "GET", body } = {}) {
  const options = { method, credentials: "include", headers: {} };
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch("/api" + path, options);
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // empty body
  }

  if (!response.ok) {
    const error = new Error(readError(data, response.status));
    error.status = response.status;
    throw error;
  }
  return data;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

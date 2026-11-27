const location = globalThis.location;
const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(location?.hostname);
const defaultServer = import.meta.env.DEV || isLocal || location?.protocol === "https:" ? "" : "http://west.edu.mn:3000";

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL?.trim() || `${defaultServer}/api/v1`).replace(/\/+$/, "") + "/";
export const uploadBaseUrl = (import.meta.env.VITE_UPLOAD_BASE_URL?.trim() || `${defaultServer}/upload`).replace(/\/+$/, "");

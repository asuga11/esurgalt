const defaultServer = globalThis.location?.protocol === "https:" ? globalThis.location.origin : "http://west.edu.mn:3000";

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL?.trim() || `${defaultServer}/api/v1`).replace(/\/+$/, "") + "/";
export const uploadBaseUrl = (import.meta.env.VITE_UPLOAD_BASE_URL?.trim() || `${defaultServer}/upload`).replace(/\/+$/, "");

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL?.trim() || "http://west.edu.mn:3000/api/v1").replace(/\/+$/, "") + "/";
export const uploadBaseUrl = (import.meta.env.VITE_UPLOAD_BASE_URL?.trim() || "http://west.edu.mn:3000/upload").replace(/\/+$/, "");

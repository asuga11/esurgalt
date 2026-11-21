import axios from "axios";
import { apiBaseUrl } from "./config";

const AxiosDB = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

AxiosDB.interceptors.response.use(
  (response) => response,
  (error) => {
    const responseData = error.response?.data;
    const serverMessage = [
      responseData?.error,
      responseData?.message,
      responseData?.msg,
      responseData?.errors?.[0]?.message,
    ].find((value) => typeof value === "string" && value.trim());
    const message = serverMessage || (
      error.code === "ECONNABORTED"
        ? "Сервер хариу өгөх хугацаа хэтэрлээ"
        : error.response
          ? "Хүсэлт амжилтгүй боллоо"
          : "Сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу"
    );

    // Keep the existing callers safe: many read error.response.data.error directly.
    error.response = {
      ...error.response,
      data: { ...(responseData && typeof responseData === "object" ? responseData : {}), error: message },
    };
    return Promise.reject(error);
  }
);

export default AxiosDB;

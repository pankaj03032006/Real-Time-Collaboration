import { axiosInstance } from "./axios";

export async function getStreamToken() {
  const response = await axiosInstance.get("/api/chat/token");
  return response.data;
}

import { LoginFormValues } from "@/components/auth/LoginForm";
import { axiosInstance } from "./axios.instance";

export const login = async (data: LoginFormValues) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

export const signup = async (data: LoginFormValues) => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
};

import { LoginFormValues } from "@/components/auth/LoginForm";
import { axiosInstance } from "./axios.instance";
import { SignupFormValues } from "@/components/auth/SignupForm";

export const login = async (data: LoginFormValues) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

export const signup = async (data: SignupFormValues) => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

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

export const verifyCurrentPass = async (password: string) => {
  const response = await axiosInstance.post("/auth/verify-current-password", {
    password,
  });
  return response.data;
};

export const resetPassword = async (
  newPassword: string,
  confirmPassword: string
) => {
  const response = await axiosInstance.patch("/auth/reset-password", {
    newPassword,
    confirmPassword,
  });
  return response.data;
};

export const details = async () => {
  const response = await axiosInstance.get("/auth/details");
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

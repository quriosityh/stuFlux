// src/utils/http.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Create a reusable Axios instance
const http = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Generic type-safe request functions
const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await http.get(url, config);
  return response.data;
};

const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await http.post(url, data, config);
  return response.data;
};

const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await http.put(url, data, config);
  return response.data;
};

const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await http.delete(url, config);
  return response.data;
};

export default { get, post, put, del };

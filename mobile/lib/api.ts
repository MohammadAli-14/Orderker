import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import { useEffect } from "react";

// Use your deployed backend URL for physical device testing
// Switch to localhost:3000 only when testing on simulator with local backend
const API_URL = "https://orderker.onrender.com/api";

// For local development with simulator:
// const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const useApi = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      const token = await getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    // cleanup: remove interceptor when component unmounts

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [getToken]);

  return api;
};

// on every single req, we would like have an auth token so that our backend knows that we're authenticated
// we're including the auth token under the auth headers

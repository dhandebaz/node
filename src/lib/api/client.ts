import axios from "axios";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { SessionExpiredError } from "@/lib/api/errors";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    return config;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const config = error?.config as any;
    if (status === 401 && config && !config._retry) {
      config._retry = true;
      try {
        const supabase = getSupabaseBrowser();
        const refreshed = await supabase.auth.refreshSession();
        const token = refreshed.data.session?.access_token;
        if (!token) {
          throw new SessionExpiredError();
        }
        config.headers['Authorization'] = `Bearer ${token}`;
        return apiClient(config);
      } catch {
        return Promise.reject(new SessionExpiredError());
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

"use client";

import { useEffect, useState } from "react";
import type { ApiRoutes } from "@/lib/urls";
import { defaultRoutes } from "@/lib/urls";

const STORAGE_KEY = "api-console-config";

export type ApiConfig = {
  baseUrl: string;
  routes: ApiRoutes;
};

function getDefaultBaseUrl() {
  // You can change this default to your backend URL
  return "http://localhost:3001";
}

export function useApiConfig() {
  const [config, setConfig] = useState<ApiConfig>({
    baseUrl: getDefaultBaseUrl(),
    routes: defaultRoutes,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConfig(JSON.parse(raw));
    } catch {}
  }, []);

  const save = (next: ApiConfig) => {
    setConfig(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const reset = () =>
    save({ baseUrl: getDefaultBaseUrl(), routes: defaultRoutes });

  return { config, save, reset };
}

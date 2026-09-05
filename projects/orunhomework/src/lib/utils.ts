import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Adds a cache-busting query parameter to a URL to prevent browser caching.
 * Uses a daily timestamp so the cache refreshes once per day.
 */
export function cacheBustUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const separator = url.includes('?') ? '&' : '?';
  const dailyKey = Math.floor(Date.now() / (1000 * 60 * 60));
  return `${url}${separator}v=${dailyKey}`;
}

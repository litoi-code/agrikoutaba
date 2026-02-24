
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if an entry is "new" (created within the last 24 hours).
 * @param createdAt ISO date string
 */
export function isNew(createdAt?: string) {
  if (!createdAt) return false;
  try {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - createdDate.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return diffInHours >= 0 && diffInHours < 24;
  } catch {
    return false;
  }
}

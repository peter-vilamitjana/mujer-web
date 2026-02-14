import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeFormatDate(fecha: any): string {
  try {
    if (!fecha) return new Date().toISOString();

    // Handle Firestore Timestamp
    if (fecha && typeof fecha.toDate === 'function') {
      return fecha.toDate().toISOString();
    }

    // Handle JS Date or String
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }

    return date.toISOString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date().toISOString();
  }
}

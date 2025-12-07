import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge"; // You might need: npm i tailwind-merge

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
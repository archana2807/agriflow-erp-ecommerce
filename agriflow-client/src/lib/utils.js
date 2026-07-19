import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function truncate(str, len = 50) {
  return str?.length > len ? str.slice(0, len) + "..." : str;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export function getImageUrl(src) {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  if (src.startsWith("data:")) return src;
  return src;
}

export function buildQuery(params) {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.append(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

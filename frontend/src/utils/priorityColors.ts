/**
 * Priority Color Utilities
 * Maps priority levels to consistent colors: urgent=red, high=orange, normal/low=green
 */

import type { Order } from "../types";

export type PriorityColorScheme = {
  text: string;
  bg: string;
  border: string;
};

/**
 * Get text color classes for priority level
 * @param priority - Order priority level
 * @returns Tailwind CSS text color class
 */
export const getPriorityTextColor = (priority: Order["priority"]): string => {
  switch (priority) {
    case "urgent":
      return "text-red-600";
    case "high":
      return "text-orange-600";
    case "normal":
    case "low":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

/**
 * Get full color scheme for priority level
 * @param priority - Order priority level
 * @returns Object with text, background, and border color classes
 */
export const getPriorityColorScheme = (
  priority: Order["priority"]
): PriorityColorScheme => {
  switch (priority) {
    case "urgent":
      return {
        text: "text-red-800",
        bg: "bg-red-100",
        border: "border-red-300",
      };
    case "high":
      return {
        text: "text-orange-800",
        bg: "bg-orange-100",
        border: "border-orange-300",
      };
    case "normal":
      return {
        text: "text-green-800",
        bg: "bg-green-100",
        border: "border-green-300",
      };
    case "low":
      return {
        text: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-200",
      };
    default:
      return {
        text: "text-gray-800",
        bg: "bg-gray-100",
        border: "border-gray-300",
      };
  }
};

/**
 * Get priority display label
 * @param priority - Order priority level
 * @returns Formatted display label
 */
export const getPriorityLabel = (priority: Order["priority"]): string => {
  switch (priority) {
    case "urgent":
      return "URGENT";
    case "high":
      return "HIGH";
    case "normal":
      return "NORMAL";
    case "low":
      return "LOW";
    default:
      return "UNKNOWN";
  }
};

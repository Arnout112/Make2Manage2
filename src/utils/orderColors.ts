/**
 * Order Color System for Visual Tracking
 * Educational Focus: Visual order tracking through manufacturing workflow
 */

// Predefined color palette for orders (ensuring good contrast and accessibility)
const ORDER_COLORS = [
  {
    bg: "bg-red-100",
    border: "border-red-300",
    text: "text-red-800",
    dot: "bg-red-500",
  },
  {
    bg: "bg-blue-100",
    border: "border-blue-300",
    text: "text-blue-800",
    dot: "bg-blue-500",
  },
  {
    bg: "bg-green-100",
    border: "border-green-300",
    text: "text-green-800",
    dot: "bg-green-500",
  },
  {
    bg: "bg-yellow-100",
    border: "border-yellow-300",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
  },
  {
    bg: "bg-purple-100",
    border: "border-purple-300",
    text: "text-purple-800",
    dot: "bg-purple-500",
  },
  {
    bg: "bg-pink-100",
    border: "border-pink-300",
    text: "text-pink-800",
    dot: "bg-pink-500",
  },
  {
    bg: "bg-indigo-100",
    border: "border-indigo-300",
    text: "text-indigo-800",
    dot: "bg-indigo-500",
  },
  {
    bg: "bg-teal-100",
    border: "border-teal-300",
    text: "text-teal-800",
    dot: "bg-teal-500",
  },
  {
    bg: "bg-orange-100",
    border: "border-orange-300",
    text: "text-orange-800",
    dot: "bg-orange-500",
  },
  {
    bg: "bg-cyan-100",
    border: "border-cyan-300",
    text: "text-cyan-800",
    dot: "bg-cyan-500",
  },
  {
    bg: "bg-lime-100",
    border: "border-lime-300",
    text: "text-lime-800",
    dot: "bg-lime-500",
  },
  {
    bg: "bg-emerald-100",
    border: "border-emerald-300",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
  },
];

/**
 * Generate consistent color for an order based on its ID
 * This ensures the same order always has the same color across all views
 */
export function getOrderColor(orderId: string) {
  // Use a simple hash of the order ID to consistently map to a color
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    const char = orderId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Ensure positive index
  const colorIndex = Math.abs(hash) % ORDER_COLORS.length;
  return ORDER_COLORS[colorIndex];
}

/**
 * Get color with opacity for subtle background effects
 */
export function getOrderColorWithOpacity(
  orderId: string,
  opacity: "light" | "medium" | "dark" = "medium"
) {
  const color = getOrderColor(orderId);
  const opacityMap = {
    light: "50",
    medium: "100",
    dark: "200",
  };

  // Replace the opacity in the background class
  const bgClass = color.bg.replace("100", opacityMap[opacity]);

  return {
    ...color,
    bg: bgClass,
  };
}

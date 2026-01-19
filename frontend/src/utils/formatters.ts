/**
 * Formatting Utilities for Make2Manage Educational Game
 * Educational Focus: Teaching professional communication and data presentation
 */

/**
 * Educational function: Format currency values for financial displays
 * Teaching: Financial communication in manufacturing
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  includeSymbol: boolean = true
): string {
  if (isNaN(amount)) return "—";

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return includeSymbol ? formatted : formatted.replace(/[^0-9.,]/g, "").trim();
}

/**
 * Educational function: Format large numbers with appropriate units
 * Teaching: Data presentation and business communication
 */
export function formatNumber(
  value: number,
  decimals: number = 1,
  compact: boolean = false
): string {
  if (isNaN(value)) return "—";

  if (compact && Math.abs(value) >= 1000) {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(decimals)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(decimals)}K`;
    }
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Educational function: Format percentage values
 * Teaching: Performance metrics presentation
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  includeSign: boolean = true
): string {
  if (isNaN(value)) return "—";

  const formatted = value.toFixed(decimals);
  return includeSign ? `${formatted}%` : formatted;
}

/**
 * Educational function: Format order status for display
 * Teaching: Status communication and workflow visualization
 */
export function formatOrderStatus(status: string): {
  label: string;
  color: string;
  bgColor: string;
  description: string;
} {
  const statusMap: Record<
    string,
    {
      label: string;
      color: string;
      bgColor: string;
      description: string;
    }
  > = {
    draft: {
      label: "Draft",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      description: "Order being created or modified",
    },
    submitted: {
      label: "Submitted",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Order submitted by customer",
    },
    "under-review": {
      label: "Under Review",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      description: "Sales team reviewing order",
    },
    quoted: {
      label: "Quoted",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Price quote provided to customer",
    },
    approved: {
      label: "Approved",
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Order approved for production",
    },
    planning: {
      label: "Planning",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      description: "Production planning in progress",
    },
    scheduled: {
      label: "Scheduled",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Scheduled for production",
    },
    "in-production": {
      label: "In Production",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Currently being manufactured",
    },
    "quality-check": {
      label: "Quality Check",
      color: "text-teal-600",
      bgColor: "bg-teal-100",
      description: "Under quality inspection",
    },
    "ready-to-ship": {
      label: "Ready to Ship",
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Completed and ready for shipment",
    },
    shipped: {
      label: "Shipped",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Shipped to customer",
    },
    delivered: {
      label: "Delivered",
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Delivered to customer",
    },
    "completed-on-time": {
      label: "Completed On Time",
      color: "text-green-700",
      bgColor: "bg-green-200",
      description: "Successfully completed on schedule",
    },
    "completed-late": {
      label: "Completed Late",
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Completed but delivered late",
    },
    "on-hold": {
      label: "On Hold",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      description: "Temporarily suspended",
    },
    cancelled: {
      label: "Cancelled",
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Order cancelled",
    },
    error: {
      label: "Error",
      color: "text-red-700",
      bgColor: "bg-red-200",
      description: "Error in processing",
    },
  };

  return (
    statusMap[status] || {
      label: status,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      description: "Unknown status",
    }
  );
}

/**
 * Educational function: Format priority levels with visual indicators
 * Teaching: Priority communication and visual management
 */
export function formatPriority(priority: string): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  weight: number;
} {
  const priorityMap: Record<
    string,
    {
      label: string;
      color: string;
      bgColor: string;
      icon: string;
      weight: number;
    }
  > = {
    low: {
      label: "Low",
      color: "text-green-600",
      bgColor: "bg-green-100",
      icon: "↓",
      weight: 1,
    },
    normal: {
      label: "Normal",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      icon: "→",
      weight: 2,
    },
    high: {
      label: "High",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      icon: "↑",
      weight: 3,
    },
    urgent: {
      label: "Urgent",
      color: "text-red-600",
      bgColor: "bg-red-100",
      icon: "⚡",
      weight: 4,
    },
  };

  return priorityMap[priority] || priorityMap["normal"];
}

/**
 * Educational function: Format customer tier with benefits
 * Teaching: Customer segmentation and relationship management
 */
export function formatCustomerTier(tier: string): {
  label: string;
  color: string;
  bgColor: string;
  benefits: string[];
  icon: string;
} {
  const tierMap: Record<
    string,
    {
      label: string;
      color: string;
      bgColor: string;
      benefits: string[];
      icon: string;
    }
  > = {
    standard: {
      label: "Standard",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      benefits: ["Standard support", "Regular pricing", "Standard lead times"],
      icon: "👤",
    },
    premium: {
      label: "Premium",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      benefits: ["Priority support", "5% discount", "Faster lead times"],
      icon: "⭐",
    },
    vip: {
      label: "VIP",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      benefits: [
        "Dedicated account manager",
        "10% discount",
        "Rush order priority",
        "Extended credit terms",
      ],
      icon: "👑",
    },
  };

  return tierMap[tier] || tierMap["standard"];
}

/**
 * Educational function: Format phone numbers for display
 * Teaching: Professional communication formatting
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7
    )}`;
  }

  return phone; // Return original if format not recognized
}

/**
 * Educational function: Create initials from name
 * Teaching: Professional name representation
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

/**
 * Educational function: Format business address
 * Teaching: Professional address formatting
 */
export function formatAddress(
  addressLine1: string,
  addressLine2: string | undefined,
  city: string,
  state: string,
  postalCode: string,
  country: string = "USA",
  multiLine: boolean = false
): string {
  const parts = [
    addressLine1,
    addressLine2,
    `${city}, ${state} ${postalCode}`,
    country !== "USA" ? country : undefined,
  ].filter(Boolean);

  return multiLine ? parts.join("\n") : parts.join(", ");
}

/**
 * Educational function: Truncate text with ellipsis
 * Teaching: Space-efficient information display
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Educational function: Format file size
 * Teaching: Technical data presentation
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Educational function: Format validation errors for user display
 * Teaching: User-friendly error communication
 */
export function formatValidationError(field: string, error: string): string {
  const fieldNames: Record<string, string> = {
    orderValue: "Order Value",
    dueDate: "Due Date",
    customerId: "Customer",
    productId: "Product",
    quantity: "Quantity",
    priority: "Priority",
  };

  const friendlyField =
    fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1);

  return `${friendlyField}: ${error}`;
}

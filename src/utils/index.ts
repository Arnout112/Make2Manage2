/**
 * Utils Index - Centralized exports for all utility functions
 * Educational Focus: Organized access to educational utility functions
 */

// Date utilities
export * from "./dateUtils";

// Formatting utilities
export * from "./formatters";

// Calculation utilities
export * from "./calculations";

// Validation utilities
export * from "./validators";

// Re-export commonly used functions for convenience
export {
  formatDate,
  getDaysUntilDue,
  getUrgencyLevel,
  formatDuration,
  isDeliveryDateAchievable,
} from "./dateUtils";

export {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatOrderStatus,
  formatPriority,
  formatCustomerTier,
} from "./formatters";

export {
  calculateOrderProfitability,
  calculateCapacityUtilization,
  calculateOnTimeDelivery,
  calculateCustomerSatisfaction,
  calculateProductionEfficiency,
} from "./calculations";

export {
  validateOrder,
  validateCustomer,
  validateDeliveryPromise,
  validateOrderApproval,
} from "./validators";

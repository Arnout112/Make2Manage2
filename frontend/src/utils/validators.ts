/**
 * Validation Utilities for Make2Manage Educational Game
 * Educational Focus: Teaching data validation and business rule enforcement
 */

/**
 * Educational function: Validate order data
 * Teaching: Data integrity and business rule validation
 */
export function validateOrder(order: {
  customerId?: string;
  orderValue?: number;
  dueDate?: string;
  quantity?: number;
  priority?: string;
  productId?: string;
}): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  educationalNotes: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const educationalNotes: string[] = [];

  // Required field validation
  if (!order.customerId) {
    errors.push("Customer selection is required");
    educationalNotes.push(
      "Every order must be linked to a customer for proper tracking and relationship management"
    );
  }

  if (!order.productId) {
    errors.push("Product selection is required");
    educationalNotes.push(
      "Product specification is essential for manufacturing planning and costing"
    );
  }

  // Order value validation
  if (order.orderValue !== undefined) {
    if (order.orderValue <= 0) {
      errors.push("Order value must be greater than zero");
      educationalNotes.push(
        "Negative or zero-value orders indicate pricing or data entry errors"
      );
    } else if (order.orderValue > 1000000) {
      warnings.push("Order value exceeds $1M - requires management approval");
      educationalNotes.push(
        "Large orders may require special handling and risk assessment"
      );
    }
  } else {
    errors.push("Order value is required");
  }

  // Quantity validation
  if (order.quantity !== undefined) {
    if (order.quantity <= 0) {
      errors.push("Quantity must be greater than zero");
    } else if (order.quantity > 10000) {
      warnings.push("Large quantity order - verify production capacity");
      educationalNotes.push(
        "High-volume orders require careful capacity planning and scheduling"
      );
    }
  } else {
    errors.push("Quantity is required");
  }

  // Due date validation
  if (order.dueDate) {
    const dueDate = new Date(order.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(dueDate.getTime())) {
      errors.push("Invalid due date format");
    } else if (dueDate < today) {
      errors.push("Due date cannot be in the past");
      educationalNotes.push(
        "Past due dates are impossible to fulfill and indicate data entry errors"
      );
    } else {
      const daysDiff = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff < 3) {
        warnings.push("Very short lead time - may require rush processing");
        educationalNotes.push(
          "Short lead times increase costs and complexity but may be necessary for customer satisfaction"
        );
      } else if (daysDiff > 365) {
        warnings.push(
          "Distant due date - consider impact on planning and forecasting"
        );
        educationalNotes.push(
          "Long lead times provide planning flexibility but may indicate customer uncertainty"
        );
      }
    }
  } else {
    errors.push("Due date is required");
    educationalNotes.push(
      "Due dates are essential for production scheduling and customer commitment"
    );
  }

  // Priority validation
  if (order.priority) {
    const validPriorities = ["low", "normal", "high", "urgent"];
    if (!validPriorities.includes(order.priority)) {
      errors.push("Invalid priority level");
    } else if (order.priority === "urgent") {
      warnings.push("Urgent priority may disrupt production schedule");
      educationalNotes.push(
        "Urgent orders should be used sparingly to maintain schedule stability"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    educationalNotes,
  };
}

/**
 * Educational function: Validate customer data
 * Teaching: Customer data quality and compliance
 */
export function validateCustomer(customer: {
  name?: string;
  email?: string;
  phone?: string;
  creditLimit?: number;
  industry?: string;
}): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  educationalNotes: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const educationalNotes: string[] = [];

  // Name validation
  if (!customer.name || customer.name.trim().length < 2) {
    errors.push("Customer name must be at least 2 characters");
    educationalNotes.push(
      "Proper customer identification is essential for relationship management and legal compliance"
    );
  }

  // Email validation
  if (customer.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      errors.push("Invalid email format");
      educationalNotes.push(
        "Valid email addresses are crucial for order confirmations and customer communication"
      );
    }
  }

  // Phone validation
  if (customer.phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(customer.phone)) {
      errors.push("Invalid phone number format");
      educationalNotes.push(
        "Valid phone numbers enable quick customer contact for order clarifications"
      );
    }
  }

  // Credit limit validation
  if (customer.creditLimit !== undefined) {
    if (customer.creditLimit < 0) {
      errors.push("Credit limit cannot be negative");
    } else if (customer.creditLimit > 500000) {
      warnings.push("High credit limit - requires credit check and approval");
      educationalNotes.push(
        "Large credit limits increase financial risk and require proper authorization"
      );
    } else if (customer.creditLimit === 0) {
      warnings.push("Zero credit limit - customer must pay in advance");
      educationalNotes.push(
        "Cash-only customers may indicate credit risk but reduce receivables exposure"
      );
    }
  }

  // Industry validation
  if (customer.industry && customer.industry.trim().length === 0) {
    warnings.push("Industry classification helps with market analysis");
    educationalNotes.push(
      "Industry data enables better market segmentation and targeted strategies"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    educationalNotes,
  };
}

/**
 * Educational function: Validate production schedule
 * Teaching: Capacity planning and resource allocation
 */
export function validateProductionSchedule(
  orders: Array<{
    id: string;
    estimatedHours: number;
    dueDate: string;
    priority: string;
  }>,
  availableCapacityPerDay: number = 8
): {
  isValid: boolean;
  conflicts: Array<{
    orderId: string;
    issue: string;
    severity: "error" | "warning";
    educationalNote: string;
  }>;
  utilizationAnalysis: {
    totalHours: number;
    availableHours: number;
    utilization: number;
    recommendation: string;
  };
} {
  const conflicts: Array<{
    orderId: string;
    issue: string;
    severity: "error" | "warning";
    educationalNote: string;
  }> = [];

  let totalHours = 0;
  const today = new Date();
  let maxDueDate = today;

  // Analyze each order
  orders.forEach((order) => {
    totalHours += order.estimatedHours;
    const dueDate = new Date(order.dueDate);

    if (dueDate > maxDueDate) {
      maxDueDate = dueDate;
    }

    // Check for unrealistic time estimates
    if (order.estimatedHours <= 0) {
      conflicts.push({
        orderId: order.id,
        issue: "Invalid time estimate",
        severity: "error",
        educationalNote:
          "All production activities require time - zero hours indicates missing planning",
      });
    } else if (order.estimatedHours > 40) {
      conflicts.push({
        orderId: order.id,
        issue: "Very long production time",
        severity: "warning",
        educationalNote:
          "Long production times may indicate complex products or inefficient processes",
      });
    }

    // Check priority vs due date alignment
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (order.priority === "urgent" && daysUntilDue > 7) {
      conflicts.push({
        orderId: order.id,
        issue: "Urgent priority with distant due date",
        severity: "warning",
        educationalNote:
          "Priority should align with actual business urgency and due dates",
      });
    }
  });

  // Calculate capacity utilization
  const workingDays = Math.max(
    1,
    Math.ceil((maxDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );
  const availableHours = workingDays * availableCapacityPerDay;
  const utilization = (totalHours / availableHours) * 100;

  let recommendation: string;
  if (utilization > 100) {
    recommendation =
      "Overloaded - need additional capacity or schedule adjustment";
    conflicts.push({
      orderId: "SCHEDULE",
      issue: "Capacity overload detected",
      severity: "error",
      educationalNote: "Overloaded schedules lead to delays and quality issues",
    });
  } else if (utilization > 90) {
    recommendation = "High utilization - monitor closely for bottlenecks";
  } else if (utilization < 60) {
    recommendation = "Low utilization - opportunity for additional orders";
  } else {
    recommendation = "Good capacity utilization";
  }

  return {
    isValid: conflicts.filter((c) => c.severity === "error").length === 0,
    conflicts,
    utilizationAnalysis: {
      totalHours,
      availableHours,
      utilization,
      recommendation,
    },
  };
}

/**
 * Educational function: Validate delivery promise
 * Teaching: Realistic commitment management
 */
export function validateDeliveryPromise(
  promisedDate: string,
  estimatedProductionHours: number,
  currentBacklog: number = 0,
  dailyCapacity: number = 8
): {
  isValid: boolean;
  feasible: boolean;
  earliestPossible: Date;
  bufferDays: number;
  riskLevel: "low" | "medium" | "high";
  educationalNote: string;
  recommendation: string;
} {
  const promised = new Date(promisedDate);
  const today = new Date();

  // Calculate earliest possible delivery
  const totalHours = currentBacklog + estimatedProductionHours;
  const workingDaysNeeded = Math.ceil(totalHours / dailyCapacity);
  const earliestPossible = new Date(today);
  earliestPossible.setDate(today.getDate() + workingDaysNeeded);

  const isValid = !isNaN(promised.getTime()) && promised > today;
  const feasible = promised >= earliestPossible;

  const bufferDays = Math.ceil(
    (promised.getTime() - earliestPossible.getTime()) / (1000 * 60 * 60 * 24)
  );

  let riskLevel: "low" | "medium" | "high";
  let educationalNote: string;
  let recommendation: string;

  if (!feasible) {
    riskLevel = "high";
    educationalNote =
      "Over-promising delivery dates damages customer trust and increases operational stress";
    recommendation = `Adjust promise date to ${earliestPossible.toLocaleDateString()} or later`;
  } else if (bufferDays < 2) {
    riskLevel = "high";
    educationalNote =
      "Tight schedules leave no room for unexpected delays or quality issues";
    recommendation = "Add buffer time to account for potential delays";
  } else if (bufferDays < 5) {
    riskLevel = "medium";
    educationalNote =
      "Moderate buffer provides some protection against schedule disruptions";
    recommendation = "Monitor production closely to ensure on-time delivery";
  } else {
    riskLevel = "low";
    educationalNote =
      "Adequate buffer time allows for quality work and handles unexpected issues";
    recommendation = "Good delivery promise with appropriate safety margin";
  }

  return {
    isValid,
    feasible,
    earliestPossible,
    bufferDays,
    riskLevel,
    educationalNote,
    recommendation,
  };
}

/**
 * Educational function: Validate business rules for order approval
 * Teaching: Business policy enforcement and decision criteria
 */
export function validateOrderApproval(order: {
  customerId: string;
  orderValue: number;
  customerCreditLimit: number;
  customerCurrentCredit: number;
  priority: string;
  profitMargin: number;
}): {
  approved: boolean;
  requiresReview: boolean;
  reasons: Array<{
    type: "approval" | "rejection" | "review";
    message: string;
    educationalNote: string;
  }>;
} {
  const reasons: Array<{
    type: "approval" | "rejection" | "review";
    message: string;
    educationalNote: string;
  }> = [];

  let approved = true;
  let requiresReview = false;

  // Credit limit check
  const availableCredit =
    order.customerCreditLimit - order.customerCurrentCredit;
  if (order.orderValue > availableCredit) {
    approved = false;
    reasons.push({
      type: "rejection",
      message: "Order exceeds customer credit limit",
      educationalNote:
        "Credit management prevents bad debt and maintains cash flow",
    });
  }

  // Profitability check
  if (order.profitMargin < 10) {
    if (order.profitMargin < 5) {
      approved = false;
      reasons.push({
        type: "rejection",
        message: "Profit margin too low (below 5%)",
        educationalNote:
          "Minimum profit margins ensure business sustainability",
      });
    } else {
      requiresReview = true;
      reasons.push({
        type: "review",
        message: "Low profit margin (5-10%) requires management review",
        educationalNote:
          "Low-margin orders may be strategic but need careful evaluation",
      });
    }
  }

  // Large order review
  if (order.orderValue > 100000) {
    requiresReview = true;
    reasons.push({
      type: "review",
      message: "Large order value requires management approval",
      educationalNote:
        "Significant orders impact capacity and cash flow planning",
    });
  }

  // Priority validation
  if (order.priority === "urgent" && order.profitMargin < 20) {
    requiresReview = true;
    reasons.push({
      type: "review",
      message: "Urgent orders typically require premium pricing",
      educationalNote:
        "Rush orders increase costs and should command higher margins",
    });
  }

  // Success case
  if (approved && !requiresReview) {
    reasons.push({
      type: "approval",
      message: "Order meets all approval criteria",
      educationalNote:
        "Systematic approval criteria ensure consistent decision-making",
    });
  }

  return {
    approved,
    requiresReview,
    reasons,
  };
}

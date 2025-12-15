/**
 * Calculation Utilities for Make2Manage Educational Game
 * Educational Focus: Teaching manufacturing calculations and KPIs
 */

import type { Order } from "../types";

/**
 * Educational function: Calculate order profitability
 * Teaching: Financial analysis in manufacturing
 */
export function calculateOrderProfitability(
  orderValue: number,
  materialCosts: number,
  laborHours: number,
  laborRate: number,
  overheadRate: number = 0.3
): {
  totalCost: number;
  profit: number;
  margin: number;
  marginPercentage: number;
  breakdown: {
    materials: number;
    labor: number;
    overhead: number;
  };
} {
  const laborCost = laborHours * laborRate;
  const overheadCost = laborCost * overheadRate;
  const totalCost = materialCosts + laborCost + overheadCost;
  const profit = orderValue - totalCost;
  const margin = profit;
  const marginPercentage = orderValue > 0 ? (profit / orderValue) * 100 : 0;

  return {
    totalCost,
    profit,
    margin,
    marginPercentage,
    breakdown: {
      materials: materialCosts,
      labor: laborCost,
      overhead: overheadCost,
    },
  };
}

/**
 * Educational function: Calculate production capacity utilization
 * Teaching: Resource management and efficiency
 */
export function calculateCapacityUtilization(
  usedHours: number,
  availableHours: number,
  efficiency: number = 1.0
): {
  utilization: number;
  utilizationPercentage: number;
  effectiveUtilization: number;
  status: "under-utilized" | "optimal" | "over-utilized" | "critical";
  recommendation: string;
} {
  const utilization = availableHours > 0 ? usedHours / availableHours : 0;
  const utilizationPercentage = utilization * 100;
  const effectiveUtilization = utilization * efficiency;

  let status: "under-utilized" | "optimal" | "over-utilized" | "critical";
  let recommendation: string;

  if (utilizationPercentage < 60) {
    status = "under-utilized";
    recommendation = "Increase production load or reduce capacity";
  } else if (utilizationPercentage <= 85) {
    status = "optimal";
    recommendation = "Capacity utilization is in optimal range";
  } else if (utilizationPercentage <= 100) {
    status = "over-utilized";
    recommendation = "Monitor for bottlenecks and quality issues";
  } else {
    status = "critical";
    recommendation =
      "Immediate capacity expansion or workload reduction needed";
  }

  return {
    utilization,
    utilizationPercentage,
    effectiveUtilization,
    status,
    recommendation,
  };
}

/**
 * Educational function: Calculate on-time delivery performance
 * Teaching: Delivery reliability metrics
 */
export function calculateOnTimeDelivery(
  totalOrders: number,
  onTimeOrders: number,
  earlyOrders: number = 0
): {
  onTimeRate: number;
  earlyRate: number;
  lateRate: number;
  performance: "excellent" | "good" | "average" | "poor";
  targetGap: number;
  improvement: string;
} {
  const onTimeRate = totalOrders > 0 ? (onTimeOrders / totalOrders) * 100 : 0;
  const earlyRate = totalOrders > 0 ? (earlyOrders / totalOrders) * 100 : 0;
  const lateRate =
    totalOrders > 0
      ? ((totalOrders - onTimeOrders - earlyOrders) / totalOrders) * 100
      : 0;

  let performance: "excellent" | "good" | "average" | "poor";
  let improvement: string;

  if (onTimeRate >= 95) {
    performance = "excellent";
    improvement = "Maintain current excellence in delivery performance";
  } else if (onTimeRate >= 85) {
    performance = "good";
    improvement = "Fine-tune processes to reach excellence";
  } else if (onTimeRate >= 70) {
    performance = "average";
    improvement = "Review production planning and capacity management";
  } else {
    performance = "poor";
    improvement = "Urgent improvement needed in scheduling and execution";
  }

  const targetGap = Math.max(0, 95 - onTimeRate); // Target is 95%

  return {
    onTimeRate,
    earlyRate,
    lateRate,
    performance,
    targetGap,
    improvement,
  };
}

/**
 * Educational function: Calculate customer satisfaction score
 * Teaching: Customer relationship metrics
 */
export function calculateCustomerSatisfaction(
  onTimeDeliveries: number,
  qualityScore: number,
  serviceScore: number,
  weights: { delivery: number; quality: number; service: number } = {
    delivery: 0.4,
    quality: 0.4,
    service: 0.2,
  }
): {
  overallScore: number;
  weightedBreakdown: {
    delivery: number;
    quality: number;
    service: number;
  };
  grade: "A" | "B" | "C" | "D" | "F";
  status:
    | "excellent"
    | "good"
    | "satisfactory"
    | "needs-improvement"
    | "critical";
  actionItems: string[];
} {
  const deliveryScore = Math.min(100, onTimeDeliveries);
  const weightedDelivery = deliveryScore * weights.delivery;
  const weightedQuality = qualityScore * weights.quality;
  const weightedService = serviceScore * weights.service;

  const overallScore = weightedDelivery + weightedQuality + weightedService;

  let grade: "A" | "B" | "C" | "D" | "F";
  let status:
    | "excellent"
    | "good"
    | "satisfactory"
    | "needs-improvement"
    | "critical";
  const actionItems: string[] = [];

  if (overallScore >= 90) {
    grade = "A";
    status = "excellent";
    actionItems.push("Maintain current service excellence");
  } else if (overallScore >= 80) {
    grade = "B";
    status = "good";
    actionItems.push("Continue strong performance with minor improvements");
  } else if (overallScore >= 70) {
    grade = "C";
    status = "satisfactory";
    actionItems.push("Focus on improvement opportunities");
  } else if (overallScore >= 60) {
    grade = "D";
    status = "needs-improvement";
    actionItems.push("Immediate attention required");
  } else {
    grade = "F";
    status = "critical";
    actionItems.push("Critical intervention needed");
  }

  // Specific action items based on weak areas
  if (deliveryScore < 80) {
    actionItems.push("Improve delivery reliability and timeliness");
  }
  if (qualityScore < 80) {
    actionItems.push("Enhance quality control processes");
  }
  if (serviceScore < 80) {
    actionItems.push("Strengthen customer service and communication");
  }

  return {
    overallScore,
    weightedBreakdown: {
      delivery: weightedDelivery,
      quality: weightedQuality,
      service: weightedService,
    },
    grade,
    status,
    actionItems,
  };
}

/**
 * Educational function: Calculate lead time variance and trends
 * Teaching: Process improvement and reliability
 */
export function calculateLeadTimeAnalysis(
  estimatedHours: number[],
  actualHours: number[]
): {
  averageEstimated: number;
  averageActual: number;
  variance: number;
  variancePercentage: number;
  accuracy: "excellent" | "good" | "fair" | "poor";
  trend: "improving" | "stable" | "declining";
  recommendation: string;
} {
  if (
    estimatedHours.length !== actualHours.length ||
    estimatedHours.length === 0
  ) {
    throw new Error(
      "Invalid data: arrays must have equal length and not be empty"
    );
  }

  const averageEstimated =
    estimatedHours.reduce((sum, val) => sum + val, 0) / estimatedHours.length;
  const averageActual =
    actualHours.reduce((sum, val) => sum + val, 0) / actualHours.length;
  const variance = averageActual - averageEstimated;
  const variancePercentage =
    averageEstimated > 0 ? (variance / averageEstimated) * 100 : 0;

  let accuracy: "excellent" | "good" | "fair" | "poor";
  if (Math.abs(variancePercentage) <= 5) {
    accuracy = "excellent";
  } else if (Math.abs(variancePercentage) <= 15) {
    accuracy = "good";
  } else if (Math.abs(variancePercentage) <= 25) {
    accuracy = "fair";
  } else {
    accuracy = "poor";
  }

  // Calculate trend (comparing first half to second half)
  const midPoint = Math.floor(actualHours.length / 2);
  const firstHalfAvg =
    actualHours.slice(0, midPoint).reduce((sum, val) => sum + val, 0) /
    midPoint;
  const secondHalfAvg =
    actualHours.slice(midPoint).reduce((sum, val) => sum + val, 0) /
    (actualHours.length - midPoint);

  let trend: "improving" | "stable" | "declining";
  const trendDiff = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

  if (trendDiff < -5) {
    trend = "improving";
  } else if (trendDiff > 5) {
    trend = "declining";
  } else {
    trend = "stable";
  }

  let recommendation: string;
  if (accuracy === "poor") {
    recommendation = "Review estimation methods and historical data";
  } else if (trend === "declining") {
    recommendation = "Investigate causes of increasing lead times";
  } else {
    recommendation = "Continue monitoring and maintain current practices";
  }

  return {
    averageEstimated,
    averageActual,
    variance,
    variancePercentage,
    accuracy,
    trend,
    recommendation,
  };
}

/**
 * Educational function: Calculate production efficiency
 * Teaching: Operational excellence metrics
 */
export function calculateProductionEfficiency(
  standardHours: number,
  actualHours: number,
  goodUnits: number,
  totalUnits: number
): {
  timeEfficiency: number;
  qualityEfficiency: number;
  overallEfficiency: number;
  oee: number; // Overall Equipment Effectiveness
  losses: {
    time: number;
    quality: number;
  };
  classification: "world-class" | "good" | "average" | "poor";
  improvements: string[];
} {
  const timeEfficiency =
    actualHours > 0 ? (standardHours / actualHours) * 100 : 0;
  const qualityEfficiency = totalUnits > 0 ? (goodUnits / totalUnits) * 100 : 0;
  const overallEfficiency = (timeEfficiency * qualityEfficiency) / 100;

  // Simplified OEE calculation (assuming 100% availability for this educational context)
  const oee = overallEfficiency;

  const timeLoss = Math.max(0, 100 - timeEfficiency);
  const qualityLoss = Math.max(0, 100 - qualityEfficiency);

  let classification: "world-class" | "good" | "average" | "poor";
  const improvements: string[] = [];

  if (oee >= 85) {
    classification = "world-class";
    improvements.push("Maintain excellence and share best practices");
  } else if (oee >= 70) {
    classification = "good";
    improvements.push("Focus on fine-tuning processes");
  } else if (oee >= 50) {
    classification = "average";
    improvements.push("Significant improvement opportunities exist");
  } else {
    classification = "poor";
    improvements.push("Urgent process review and improvement needed");
  }

  if (timeEfficiency < 80) {
    improvements.push("Reduce setup times and process inefficiencies");
  }
  if (qualityEfficiency < 95) {
    improvements.push("Improve quality control and reduce defects");
  }

  return {
    timeEfficiency,
    qualityEfficiency,
    overallEfficiency,
    oee,
    losses: {
      time: timeLoss,
      quality: qualityLoss,
    },
    classification,
    improvements,
  };
}

/**
 * Calculate reward for an order based on lateness.
 * Late orders receive 50% of their base `orderValue`.
 *
 * @param order Object of type Order.
 */
export function calculateReward(
  order: Order,
): number {
  if (order.slaStatus === "overdue") {
    return Math.round(order.orderValue * 0.5);
  }
  else {
  return order.orderValue;
  }
}

/**
 * Educational function: Calculate return on investment for process improvements
 * Teaching: Financial justification for operational changes
 */
export function calculateROI(
  investment: number,
  annualSavings: number,
  timeHorizonYears: number = 3
): {
  totalSavings: number;
  netBenefit: number;
  roi: number;
  paybackPeriod: number;
  npv: number; // Net Present Value (simplified, 10% discount rate)
  recommendation:
    | "highly-recommended"
    | "recommended"
    | "marginal"
    | "not-recommended";
} {
  const totalSavings = annualSavings * timeHorizonYears;
  const netBenefit = totalSavings - investment;
  const roi = investment > 0 ? (netBenefit / investment) * 100 : 0;
  const paybackPeriod =
    annualSavings > 0 ? investment / annualSavings : Infinity;

  // Simplified NPV calculation with 10% discount rate
  let npv = -investment;
  for (let year = 1; year <= timeHorizonYears; year++) {
    npv += annualSavings / Math.pow(1.1, year);
  }

  let recommendation:
    | "highly-recommended"
    | "recommended"
    | "marginal"
    | "not-recommended";

  if (roi >= 300 && paybackPeriod <= 1) {
    recommendation = "highly-recommended";
  } else if (roi >= 100 && paybackPeriod <= 2) {
    recommendation = "recommended";
  } else if (roi >= 50 && paybackPeriod <= 3) {
    recommendation = "marginal";
  } else {
    recommendation = "not-recommended";
  }

  return {
    totalSavings,
    netBenefit,
    roi,
    paybackPeriod,
    npv,
    recommendation,
  };
}

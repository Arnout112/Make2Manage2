/**
 * Customer Service - Business Logic for Customer Management
 * Educational Focus: Teaching customer relationship management in manufacturing
 */

import type {
  Customer,
  CustomerFilter,
  CustomerMetrics,
  CustomerAnalysis,
  CustomerTier,
  CustomerInteraction,
} from "../types/customers";

export class CustomerService {
  /**
   * Educational Method: Filter customers based on business criteria
   * Teaching: Customer segmentation and relationship management
   */
  static filterCustomers(
    customers: Customer[],
    filters: CustomerFilter
  ): Customer[] {
    return customers.filter((customer) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableFields = [
          customer.name,
          customer.customerNumber,
          customer.primaryContact.name,
          customer.industry,
          customer.primaryContact.email,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableFields.includes(searchLower)) return false;
      }

      // Tier filter
      if (filters.tier && filters.tier.length > 0) {
        if (!filters.tier.includes(customer.tier)) return false;
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(customer.status)) return false;
      }

      // Customer type filter
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(customer.type)) return false;
      }

      // Industry filter
      if (filters.industry && filters.industry.length > 0) {
        if (!filters.industry.includes(customer.industry)) return false;
      }

      // Credit rating filter
      if (filters.creditRating && filters.creditRating.length > 0) {
        if (!filters.creditRating.includes(customer.creditRating)) return false;
      }

      // Risk level filter
      if (filters.riskLevel && filters.riskLevel.length > 0) {
        if (!filters.riskLevel.includes(customer.riskLevel)) return false;
      }

      // Order value range filter
      if (filters.orderValueRange) {
        if (
          customer.averageOrderValue < filters.orderValueRange.min ||
          customer.averageOrderValue > filters.orderValueRange.max
        )
          return false;
      }

      // Recent order activity filter
      if (filters.lastOrderDays && customer.lastOrderDate) {
        const daysSinceLastOrder = Math.floor(
          (Date.now() - new Date(customer.lastOrderDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastOrder > filters.lastOrderDays) return false;
      }

      // Satisfaction range filter
      if (filters.satisfactionRange) {
        if (
          customer.satisfactionScore < filters.satisfactionRange.min ||
          customer.satisfactionScore > filters.satisfactionRange.max
        )
          return false;
      }

      return true;
    });
  }

  /**
   * Educational Method: Sort customers by business value
   * Teaching: Customer prioritization and resource allocation
   */
  static sortCustomersByValue(customers: Customer[]): Customer[] {
    const tierWeights: Record<CustomerTier, number> = {
      vip: 3,
      premium: 2,
      standard: 1,
    };

    return [...customers].sort((a, b) => {
      // 1. Sort by tier first
      const tierDiff = tierWeights[b.tier] - tierWeights[a.tier];
      if (tierDiff !== 0) return tierDiff;

      // 2. Sort by lifetime value
      const valueDiff = b.totalLifetimeValue - a.totalLifetimeValue;
      if (valueDiff !== 0) return valueDiff;

      // 3. Sort by satisfaction score
      const satisfactionDiff = b.satisfactionScore - a.satisfactionScore;
      if (satisfactionDiff !== 0) return satisfactionDiff;

      // 4. Sort by recent activity
      const aLastOrder = a.lastOrderDate
        ? new Date(a.lastOrderDate).getTime()
        : 0;
      const bLastOrder = b.lastOrderDate
        ? new Date(b.lastOrderDate).getTime()
        : 0;

      return bLastOrder - aLastOrder;
    });
  }

  /**
   * Educational Method: Calculate customer metrics
   * Teaching: Customer KPIs and relationship health measurement
   */
  static calculateCustomerMetrics(customers: Customer[]): CustomerMetrics {
    const activeCustomers = customers.filter((c) => c.status === "active");
    const vipCustomers = customers.filter((c) => c.tier === "vip");
    const premiumCustomers = customers.filter((c) => c.tier === "premium");
    const standardCustomers = customers.filter((c) => c.tier === "standard");

    // Calculate new customers this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const newCustomersThisMonth = customers.filter(
      (c) => new Date(c.createdAt) >= oneMonthAgo
    ).length;

    // Calculate lost customers (no orders in last 6 months and status changed to inactive)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const lostCustomersThisMonth = customers.filter(
      (c) =>
        c.status === "inactive" &&
        c.lastOrderDate &&
        new Date(c.lastOrderDate) < sixMonthsAgo
    ).length;

    // Financial calculations
    const totalCreditExposure = customers.reduce(
      (sum, c) => sum + c.currentCredit,
      0
    );
    const averageCreditLimit =
      customers.length > 0
        ? customers.reduce((sum, c) => sum + c.creditLimit, 0) /
          customers.length
        : 0;
    const totalOutstanding = customers.reduce(
      (sum, c) => sum + (c.creditLimit - c.availableCredit),
      0
    );

    // Calculate bad debt rate (simplified - customers with overdue payments > 90 days)
    const customersWithBadDebt = customers.filter((c) =>
      c.paymentHistory.some(
        (p) => p.status === "overdue" && (p.daysPastDue || 0) > 90
      )
    ).length;
    const badDebtRate =
      customers.length > 0
        ? (customersWithBadDebt / customers.length) * 100
        : 0;

    // Satisfaction and loyalty
    const averageSatisfactionScore =
      customers.length > 0
        ? customers.reduce((sum, c) => sum + c.satisfactionScore, 0) /
          customers.length
        : 0;
    const averageLoyaltyScore =
      customers.length > 0
        ? customers.reduce((sum, c) => sum + c.loyaltyScore, 0) /
          customers.length
        : 0;

    // Retention and repeat rates (simplified calculation)
    const customersWithMultipleOrders = customers.filter(
      (c) => c.totalOrderCount > 1
    ).length;
    const repeatOrderRate =
      customers.length > 0
        ? (customersWithMultipleOrders / customers.length) * 100
        : 0;

    // Customer lifetime value
    const customerLifetimeValue =
      customers.length > 0
        ? customers.reduce((sum, c) => sum + c.totalLifetimeValue, 0) /
          customers.length
        : 0;

    return {
      // Count Metrics
      totalCustomers: customers.length,
      activeCustomers: activeCustomers.length,
      newCustomersThisMonth,
      lostCustomersThisMonth,

      // Tier Distribution
      vipCustomers: vipCustomers.length,
      premiumCustomers: premiumCustomers.length,
      standardCustomers: standardCustomers.length,

      // Financial Metrics
      totalCreditExposure,
      averageCreditLimit,
      totalOutstanding,
      badDebtRate,

      // Relationship Metrics
      averageSatisfactionScore,
      averageLoyaltyScore,
      customerRetentionRate:
        100 - (lostCustomersThisMonth / Math.max(customers.length, 1)) * 100,
      repeatOrderRate,

      // Operational Metrics (simplified for demo)
      averageResponseTime: 24, // hours
      complaintResolutionTime: 72, // hours
      orderFulfillmentAccuracy: 95, // percentage

      // Business Metrics
      customerLifetimeValue,
      acquisitionCost: 500, // Simplified value
      churnRate: (lostCustomersThisMonth / Math.max(customers.length, 1)) * 100,
      upsellSuccess: 15, // percentage
    };
  }

  /**
   * Educational Method: Analyze customer segment and risk
   * Teaching: Customer value analysis and relationship strategies
   */
  static analyzeCustomer(customer: Customer): CustomerAnalysis {
    let segment: CustomerAnalysis["segment"] = "new";
    let valueScore = 0;
    let riskScore = 0;
    let growthPotential: CustomerAnalysis["growthPotential"] = "medium";

    // Calculate value score (0-100)
    valueScore += Math.min(customer.totalLifetimeValue / 10000, 30); // Up to 30 points for lifetime value
    valueScore += Math.min(customer.averageOrderValue / 1000, 20); // Up to 20 points for order value
    valueScore += Math.min(customer.totalOrderCount * 2, 20); // Up to 20 points for order frequency
    valueScore += customer.satisfactionScore / 5; // Up to 20 points for satisfaction
    valueScore += customer.loyaltyScore / 10; // Up to 10 points for loyalty

    // Calculate risk score (0-100, higher = more risk)
    riskScore +=
      customer.riskLevel === "critical"
        ? 40
        : customer.riskLevel === "high"
        ? 30
        : customer.riskLevel === "medium"
        ? 15
        : 5;

    riskScore +=
      customer.creditRating === "C"
        ? 30
        : customer.creditRating === "B"
        ? 20
        : customer.creditRating === "BB"
        ? 15
        : customer.creditRating === "BBB"
        ? 10
        : 5;

    const creditUtilization =
      (customer.creditLimit - customer.availableCredit) / customer.creditLimit;
    riskScore += Math.min(creditUtilization * 20, 20);

    // Days since last order risk
    if (customer.lastOrderDate) {
      const daysSinceLastOrder = Math.floor(
        (Date.now() - new Date(customer.lastOrderDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      riskScore += Math.min(daysSinceLastOrder / 10, 10);
    }

    // Determine customer segment
    if (customer.totalOrderCount === 0) {
      segment = "new";
    } else if (valueScore >= 80 && riskScore <= 20) {
      segment = "champion";
    } else if (valueScore >= 60 && customer.loyaltyScore >= 70) {
      segment = "loyal";
    } else if (valueScore >= 40 && customer.totalOrderCount <= 3) {
      segment = "potential-loyal";
    } else if (riskScore >= 60) {
      segment = "at-risk";
    } else if (valueScore >= 70 && riskScore >= 40) {
      segment = "cannot-lose";
    } else {
      segment = "hibernating";
    }

    // Determine growth potential
    if (customer.tier === "standard" && customer.satisfactionScore >= 80) {
      growthPotential = "high";
    } else if (customer.tier === "vip" || customer.averageOrderValue >= 50000) {
      growthPotential = "low"; // Already maximized
    } else {
      growthPotential = "medium";
    }

    // Generate recommendations
    const recommendedActions: string[] = [];
    const keyInsights: string[] = [];

    switch (segment) {
      case "champion":
        recommendedActions.push(
          "Maintain excellent service",
          "Consider VIP upgrades",
          "Request referrals"
        );
        keyInsights.push(
          "High-value, low-risk customer - excellent relationship health"
        );
        break;
      case "loyal":
        recommendedActions.push(
          "Explore upselling opportunities",
          "Reward loyalty",
          "Gather feedback"
        );
        keyInsights.push("Strong relationship with growth potential");
        break;
      case "potential-loyal":
        recommendedActions.push(
          "Increase engagement",
          "Provide exceptional service",
          "Build relationship"
        );
        keyInsights.push(
          "New customer with good potential - focus on retention"
        );
        break;
      case "at-risk":
        recommendedActions.push(
          "Immediate contact required",
          "Address concerns",
          "Review account status"
        );
        keyInsights.push("High risk of churn - immediate attention needed");
        break;
      case "cannot-lose":
        recommendedActions.push(
          "Emergency intervention",
          "Senior management contact",
          "Special offers"
        );
        keyInsights.push("High-value customer at risk - critical situation");
        break;
      case "hibernating":
        recommendedActions.push(
          "Reactivation campaign",
          "Special offers",
          "Check satisfaction"
        );
        keyInsights.push(
          "Previously active customer - potential for reactivation"
        );
        break;
      case "new":
        recommendedActions.push(
          "Welcome process",
          "Onboarding support",
          "Regular check-ins"
        );
        keyInsights.push("New customer - focus on successful onboarding");
        break;
    }

    if (riskScore > 50) {
      keyInsights.push("Elevated risk factors require monitoring");
    }
    if (valueScore > 70) {
      keyInsights.push("High-value customer deserves premium attention");
    }

    const nextContactSuggestion =
      segment === "at-risk" || segment === "cannot-lose"
        ? "Schedule immediate call to address concerns"
        : segment === "champion" || segment === "loyal"
        ? "Regular relationship maintenance call"
        : "Follow-up on recent interactions and satisfaction";

    return {
      customerId: customer.id,
      segment,
      valueScore: Math.round(valueScore),
      riskScore: Math.round(riskScore),
      growthPotential,
      recommendedActions,
      keyInsights,
      nextContactSuggestion,
    };
  }

  /**
   * Educational Method: Track customer interactions
   * Teaching: Customer communication and relationship building
   */
  static recordCustomerInteraction(
    customerId: string,
    interaction: Omit<CustomerInteraction, "id" | "customerId" | "createdAt">
  ): CustomerInteraction {
    return {
      id: `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      createdAt: new Date().toISOString(),
      ...interaction,
    };
  }

  /**
   * Educational Method: Calculate customer satisfaction impact
   * Teaching: How operational decisions affect customer relationships
   */
  static calculateSatisfactionImpact(
    customer: Customer,
    event:
      | "on-time-delivery"
      | "late-delivery"
      | "quality-issue"
      | "excellent-service"
      | "complaint-resolved"
  ): number {
    const baseImpact = {
      "on-time-delivery": 2,
      "late-delivery": -5,
      "quality-issue": -8,
      "excellent-service": 5,
      "complaint-resolved": 3,
    };

    let impact = baseImpact[event];

    // Adjust based on customer tier - VIP customers are more sensitive
    if (customer.tier === "vip") {
      impact *= 1.5;
    } else if (customer.tier === "premium") {
      impact *= 1.2;
    }

    // Adjust based on current satisfaction - low satisfaction customers are more sensitive to negative events
    if (customer.satisfactionScore < 60 && impact < 0) {
      impact *= 1.3;
    }

    return Math.round(impact);
  }
}

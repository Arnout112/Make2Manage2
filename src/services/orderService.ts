/**
 * Order Service - Business Logic for Order Management
 * Educational Focus: Teaching order prioritization, scheduling, and production planning
 */

import type {
  Order,
  OrderFilter,
  OrderMetrics,
  OrderPriority,
  OrderAnalysis,
  ProductionRoute,
} from "../types/orders";
import type { DecisionOutcome } from "../types/game";

export class OrderService {
  /**
   * Educational Method: Filter orders based on business criteria
   * Teaching: How filtering affects production planning and customer service
   */
  static filterOrders(orders: Order[], filters: OrderFilter): Order[] {
    return orders.filter((order) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableFields = [
          order.id,
          order.orderNumber,
          order.customerName,
          order.productName,
          order.customerPO || "",
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableFields.includes(searchLower)) return false;
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(order.status)) return false;
      }

      // Priority filter
      if (filters.priority && filters.priority.length > 0) {
        if (!filters.priority.includes(order.priority)) return false;
      }

      // Order type filter
      if (filters.orderType && filters.orderType.length > 0) {
        if (!filters.orderType.includes(order.orderType)) return false;
      }

      // Customer filter
      if (filters.customer && order.customerId !== filters.customer) {
        return false;
      }

      // Rush orders only
      if (filters.rushOnly && !order.rushOrder) {
        return false;
      }

      // Production route filter
      if (filters.route && filters.route.length > 0) {
        const hasMatchingRoute = order.route.some((r) =>
          filters.route!.includes(r)
        );
        if (!hasMatchingRoute) return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const orderDate = new Date(
          order[filters.dateRange.field] || order.createdAt
        );
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        if (orderDate < start || orderDate > end) return false;
      }

      // Value range filter
      if (filters.valueRange) {
        if (
          order.orderValue < filters.valueRange.min ||
          order.orderValue > filters.valueRange.max
        )
          return false;
      }

      return true;
    });
  }

  /**
   * Educational Method: Sort orders by business priority
   * Teaching: Priority-based scheduling in make-to-order manufacturing
   */
  static sortOrdersByPriority(orders: Order[]): Order[] {
    const priorityWeights: Record<OrderPriority, number> = {
      urgent: 4,
      high: 3,
      normal: 2,
      low: 1,
    };

    return [...orders].sort((a, b) => {
      // 1. Rush orders get highest priority
      if (a.rushOrder && !b.rushOrder) return -1;
      if (!a.rushOrder && b.rushOrder) return 1;

      // 2. Sort by priority level
      const priorityDiff =
        priorityWeights[b.priority] - priorityWeights[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // 3. Sort by due date (earliest first)
      const dueDateA = a.dueDate
        ? new Date(a.dueDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      const dueDateB = b.dueDate
        ? new Date(b.dueDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      const dueDateDiff = dueDateA - dueDateB;
      if (dueDateDiff !== 0) return dueDateDiff;

      // 4. Sort by order value (higher first) for tie-breaking
      const valueDiff = b.orderValue - a.orderValue;
      if (valueDiff !== 0) return valueDiff;

      // 5. Finally by creation date
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  /**
   * Educational Method: Calculate key performance indicators
   * Teaching: KPIs in manufacturing operations and their business impact
   */
  static calculateOrderMetrics(orders: Order[]): OrderMetrics {
    const completedOrders = orders.filter(
      (o) =>
        o.status === "completed-on-time" ||
        o.status === "completed-late" ||
        o.status === "delivered"
    );

    const onTimeOrders = orders.filter(
      (o) =>
        o.status === "completed-on-time" ||
        (o.status === "delivered" && o.onTimeDelivery)
    );

    const activeOrders = orders.filter(
      (o) =>
        ![
          "completed-on-time",
          "completed-late",
          "delivered",
          "cancelled",
          "error",
        ].includes(o.status)
    );

    const cancelledOrders = orders.filter((o) => o.status === "cancelled");

    // Financial calculations
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.orderValue,
      0
    );
    const totalProfitMargin = completedOrders.reduce(
      (sum, order) =>
        sum + (order.actualCost ? order.orderValue - order.actualCost : 0),
      0
    );

    // Time calculations
    const ordersWithDuration = completedOrders.filter(
      (o) => o.actualDuration && o.estimatedDuration
    );
    const totalActualTime = ordersWithDuration.reduce(
      (sum, o) => sum + (o.actualDuration || 0),
      0
    );
    const totalEstimatedTime = ordersWithDuration.reduce(
      (sum, o) => sum + o.estimatedDuration,
      0
    );

    // Quality calculations
    const ordersWithQuality = completedOrders.filter(
      (o) => o.qualityScore !== undefined
    );
    const averageQualityScore =
      ordersWithQuality.length > 0
        ? ordersWithQuality.reduce((sum, o) => sum + (o.qualityScore || 0), 0) /
          ordersWithQuality.length
        : 0;

    // Customer satisfaction
    const ordersWithSatisfaction = completedOrders.filter(
      (o) => o.customerSatisfaction !== undefined
    );
    const customerSatisfactionAvg =
      ordersWithSatisfaction.length > 0
        ? ordersWithSatisfaction.reduce(
            (sum, o) => sum + (o.customerSatisfaction || 0),
            0
          ) / ordersWithSatisfaction.length
        : 0;

    // Rush order analysis
    const rushOrders = orders.filter((o) => o.rushOrder);

    // Bottleneck analysis
    const routeFrequency: Record<ProductionRoute, number> = {} as any;
    orders.forEach((order) => {
      order.route.forEach((route) => {
        routeFrequency[route] = (routeFrequency[route] || 0) + 1;
      });
    });

    const bottleneckRoutes = Object.entries(routeFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([route]) => route as ProductionRoute);

    return {
      // Volume Metrics
      totalOrders: orders.length,
      activeOrders: activeOrders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,

      // Performance Metrics
      onTimeDeliveryRate:
        completedOrders.length > 0
          ? (onTimeOrders.length / completedOrders.length) * 100
          : 0,
      averageLeadTime:
        ordersWithDuration.length > 0
          ? totalActualTime / ordersWithDuration.length
          : 0,
      averageProcessingTime:
        ordersWithDuration.length > 0
          ? ordersWithDuration.reduce(
              (sum, o) => sum + (o.processingTime || 0),
              0
            ) / ordersWithDuration.length
          : 0,
      averageSetupTime:
        ordersWithDuration.length > 0
          ? ordersWithDuration.reduce((sum, o) => sum + o.setupTime, 0) /
            ordersWithDuration.length
          : 0,

      // Financial Metrics
      totalRevenue,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      totalProfitMargin,
      averageProfitMargin:
        completedOrders.length > 0
          ? totalProfitMargin / completedOrders.length
          : 0,

      // Quality Metrics
      averageQualityScore,
      defectRate:
        ordersWithQuality.length > 0
          ? (ordersWithQuality.filter((o) => (o.qualityScore || 0) < 80)
              .length /
              ordersWithQuality.length) *
            100
          : 0,
      reworkRate:
        (orders.filter((o) => o.orderType === "rework").length /
          orders.length) *
        100,

      // Customer Metrics
      customerSatisfactionAvg,
      repeatOrderRate: 0, // Would need customer history to calculate

      // Operational Metrics
      resourceUtilization:
        totalEstimatedTime > 0
          ? (totalActualTime / totalEstimatedTime) * 100
          : 0,
      bottleneckRoutes,
      rushOrderPercentage:
        orders.length > 0 ? (rushOrders.length / orders.length) * 100 : 0,
    };
  }

  /**
   * Educational Method: Validate business decisions and provide feedback
   * Teaching: Impact of order management decisions on company performance
   */
  static validateOrderDecision(
    order: Order,
    decision: string,
    context: any
  ): DecisionOutcome {
    const feedback: DecisionOutcome = {
      success: true,
      points: 0,
      feedback: "",
      learningPoints: [],
      impactOnKPIs: {},
    };

    switch (decision) {
      case "rush_approved":
        if (order.priority === "urgent" || order.rushOrder) {
          feedback.points = 20;
          feedback.feedback =
            "Good decision! This urgent order maintains customer satisfaction.";
          feedback.learningPoints.push(
            "Rush orders increase customer loyalty but may disrupt production schedules"
          );
          feedback.impactOnKPIs.customerSatisfaction = 5;
          feedback.impactOnKPIs.operationalEfficiency = -2;
        } else {
          feedback.points = -5;
          feedback.feedback =
            "Consider if this rush really justifies disrupting the schedule.";
          feedback.learningPoints.push(
            "Unnecessary rush orders increase costs without proportional benefits"
          );
          feedback.impactOnKPIs.operationalEfficiency = -5;
        }
        break;

      case "order_released":
        if (!order.route || order.route.length === 0) {
          feedback.success = false;
          feedback.feedback =
            "Cannot release order without defined production route!";
          feedback.learningPoints.push(
            "Complete production planning is essential before releasing orders to the floor"
          );
          feedback.points = -10;
        } else if (!order.promisedDeliveryDate) {
          feedback.success = false;
          feedback.feedback =
            "Must confirm delivery date before releasing order!";
          feedback.learningPoints.push(
            "Customer communication is crucial in make-to-order manufacturing"
          );
          feedback.points = -5;
        } else {
          feedback.points = 15;
          feedback.feedback =
            "Order successfully released to production floor.";
          feedback.learningPoints.push(
            "Proper order release maintains production flow and customer expectations"
          );
          feedback.impactOnKPIs.operationalEfficiency = 3;
        }
        break;

      case "priority_changed":
        const newPriority = context.newPriority as OrderPriority;
        const oldPriority = order.priority;

        if (newPriority === "urgent" && oldPriority !== "urgent") {
          feedback.feedback =
            "Priority increased - this will disrupt current schedule.";
          feedback.learningPoints.push(
            "Priority changes have cascading effects on other orders"
          );
          feedback.points =
            newPriority === "urgent" && order.rushOrder ? 10 : -3;
          feedback.impactOnKPIs.operationalEfficiency = -3;
        } else if (newPriority === "low" && oldPriority === "urgent") {
          feedback.feedback =
            "Priority reduced - other orders can now be processed more efficiently.";
          feedback.points = 5;
          feedback.impactOnKPIs.operationalEfficiency = 2;
        }
        break;

      case "delivery_promised":
        const promisedDate = new Date(context.promisedDate);
        const estimatedCompletion = new Date();
        estimatedCompletion.setHours(
          estimatedCompletion.getHours() + order.estimatedDuration
        );

        if (promisedDate > estimatedCompletion) {
          feedback.points = 10;
          feedback.feedback =
            "Realistic delivery promise maintains customer trust.";
          feedback.impactOnKPIs.customerSatisfaction = 3;
        } else {
          feedback.points = -5;
          feedback.feedback =
            "This delivery promise may be too aggressive given current capacity.";
          feedback.learningPoints.push(
            "Over-promising delivery dates damages customer relationships"
          );
          feedback.impactOnKPIs.customerSatisfaction = -5;
        }
        break;

      default:
        feedback.feedback = "Decision recorded for analysis.";
    }

    return feedback;
  }

  /**
   * Educational Method: Analyze order for learning insights
   * Teaching: Order analysis and continuous improvement
   */
  static analyzeOrderEducationally(order: Order): OrderAnalysis {
    const insights = [];
    const recommendations = [];

    // Analyze priority vs actual urgency
    if (order.priority === "urgent" && !order.rushOrder) {
      insights.push({
        concept: "Priority Management",
        demonstration: "High priority order without rush designation",
        learningOutcome:
          "Priority should align with customer requirements and business impact",
      });
    }

    // Analyze lead time performance
    if (order.actualDuration && order.estimatedDuration) {
      const variance =
        ((order.actualDuration - order.estimatedDuration) /
          order.estimatedDuration) *
        100;
      if (Math.abs(variance) > 20) {
        insights.push({
          concept: "Estimation Accuracy",
          demonstration: `${
            variance > 0 ? "Over" : "Under"
          }estimated by ${Math.abs(variance).toFixed(1)}%`,
          learningOutcome:
            "Accurate time estimation is crucial for reliable delivery promises",
        });

        if (variance > 0) {
          recommendations.push(
            "Review production process for bottlenecks or inefficiencies"
          );
        } else {
          recommendations.push(
            "Consider if estimation methods are too conservative"
          );
        }
      }
    }

    // Analyze profit margin
    if (order.profitMargin < 10) {
      insights.push({
        concept: "Profitability Analysis",
        demonstration: "Low profit margin order",
        learningOutcome:
          "Balancing competitive pricing with profitability requirements",
      });
      recommendations.push("Review pricing strategy for similar orders");
    }

    // Calculate performance impact
    const performanceImpact = {
      financial: order.profitMargin,
      operational: order.onTimeDelivery ? 1 : -1,
      customer: order.customerSatisfaction || 0,
    };

    return {
      orderId: order.id,
      decisions: order.decisionPoints,
      educationalInsights: insights,
      performanceImpact,
      recommendations,
    };
  }
}

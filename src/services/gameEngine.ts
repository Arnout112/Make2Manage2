/**
 * Game Engine - Core Educational Game Logic
 * Educational Focus: Manufacturing simulation and learning progression
 */

import type {
  GameState,
  GameConfiguration,
  PlayerDecision,
  DecisionOutcome,
  GamePhase,
  PerformanceMetrics,
} from "../types/game";
import type { Order } from "../types/orders";
import type { Customer } from "../types/customers";
import { OrderService } from "./orderService";
import { CustomerService } from "./customerService";

export class GameEngine {
  /**
   * Educational Method: Initialize new game session
   * Teaching: Setting up manufacturing scenarios with learning objectives
   */
  static initializeGame(config: GameConfiguration): GameState {
    return {
      gameId: `GAME-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      currentPhase: "tutorial",
      playerRole: "sales-manager",
      difficultyLevel: config.difficultyLevel,
      startTime: new Date(),

      objectives: config.learningObjectives.map((obj) => ({
        ...obj,
        completed: false,
      })),
      decisions: [],
      totalScore: 0,

      companyCash: config.startingCash,
      companyReputation: config.baseReputation,
      customerSatisfactionAvg: 75,
      operationalEfficiency: 70,

      currentWeek: 1,
      totalWeeks: config.totalWeeks,
      timeMultiplier: 1,

      hintsEnabled: config.enableRealTimeGuidance,
      tutorialCompleted: false,
      assistanceLevel: "hints",
    };
  }

  /**
   * Educational Method: Process player decisions and provide feedback
   * Teaching: Decision impact analysis and learning reinforcement
   */
  static processDecision(
    gameState: GameState,
    decision: Omit<PlayerDecision, "id" | "timestamp" | "outcome">,
    orders: Order[],
    customers: Customer[]
  ): {
    updatedGameState: GameState;
    outcome: DecisionOutcome;
    updatedOrders?: Order[];
    updatedCustomers?: Customer[];
  } {
    const decisionId = `DEC-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create decision record
    const playerDecision: PlayerDecision = {
      id: decisionId,
      timestamp: new Date(),
      outcome: undefined,
      ...decision,
    };

    let outcome: DecisionOutcome;
    let updatedGameState = { ...gameState };
    let updatedOrders = [...orders];
    let updatedCustomers = [...customers];

    // Process decision based on type and context
    switch (decision.decision) {
      case "order_approved":
      case "order_rejected":
      case "priority_changed":
      case "rush_approved":
        const orderId = decision.context.orderId as string;
        const order = orders.find((o) => o.id === orderId);

        if (order) {
          outcome = OrderService.validateOrderDecision(
            order,
            decision.decision,
            decision.context
          );

          // Update order if decision was successful
          if (outcome.success && decision.decision === "order_approved") {
            const orderIndex = updatedOrders.findIndex((o) => o.id === orderId);
            if (orderIndex >= 0) {
              updatedOrders[orderIndex] = {
                ...updatedOrders[orderIndex],
                status: "approved",
                statusHistory: [
                  ...updatedOrders[orderIndex].statusHistory,
                  {
                    fromStatus: updatedOrders[orderIndex].status,
                    toStatus: "approved",
                    timestamp: new Date().toISOString(),
                    changedBy: gameState.playerRole,
                    reason: "Player decision",
                  },
                ],
              };
            }
          }

          // Update customer satisfaction based on decision
          if (decision.decision === "rush_approved") {
            const customer = customers.find((c) => c.id === order.customerId);
            if (customer) {
              const satisfactionImpact =
                CustomerService.calculateSatisfactionImpact(
                  customer,
                  "excellent-service"
                );
              const customerIndex = updatedCustomers.findIndex(
                (c) => c.id === customer.id
              );
              if (customerIndex >= 0) {
                updatedCustomers[customerIndex] = {
                  ...updatedCustomers[customerIndex],
                  satisfactionScore: Math.min(
                    100,
                    customer.satisfactionScore + satisfactionImpact
                  ),
                };
              }
            }
          }
        } else {
          outcome = {
            success: false,
            points: -5,
            feedback: "Order not found. Please refresh and try again.",
            learningPoints: [
              "System integrity is important in manufacturing operations",
            ],
            impactOnKPIs: {},
          };
        }
        break;

      case "phase_completed":
        outcome = this.completePhase(
          updatedGameState,
          decision.context.phase as GamePhase
        );
        break;

      case "tutorial_step_completed":
        outcome = {
          success: true,
          points: 5,
          feedback: "Tutorial step completed successfully!",
          learningPoints: [`Completed: ${decision.context.step}`],
          impactOnKPIs: {},
        };
        break;

      default:
        outcome = {
          success: true,
          points: 0,
          feedback: "Decision recorded for analysis.",
          learningPoints: [],
          impactOnKPIs: {},
        };
    }

    // Update game state based on outcome
    updatedGameState = {
      ...updatedGameState,
      totalScore: updatedGameState.totalScore + outcome.points,
      decisions: [
        ...updatedGameState.decisions,
        { ...playerDecision, outcome },
      ],
    };

    // Update KPIs based on decision impact
    if (outcome.impactOnKPIs.customerSatisfaction) {
      updatedGameState.customerSatisfactionAvg = Math.max(
        0,
        Math.min(
          100,
          updatedGameState.customerSatisfactionAvg +
            outcome.impactOnKPIs.customerSatisfaction
        )
      );
    }

    if (outcome.impactOnKPIs.operationalEfficiency) {
      updatedGameState.operationalEfficiency = Math.max(
        0,
        Math.min(
          100,
          updatedGameState.operationalEfficiency +
            outcome.impactOnKPIs.operationalEfficiency
        )
      );
    }

    if (outcome.impactOnKPIs.reputation) {
      updatedGameState.companyReputation = Math.max(
        0,
        Math.min(
          100,
          updatedGameState.companyReputation + outcome.impactOnKPIs.reputation
        )
      );
    }

    // Check for completed learning objectives
    updatedGameState = this.checkLearningObjectives(updatedGameState);

    return {
      updatedGameState,
      outcome,
      updatedOrders,
      updatedCustomers,
    };
  }

  /**
   * Educational Method: Complete game phase and unlock next phase
   * Teaching: Progressive learning and milestone achievement
   */
  static completePhase(
    gameState: GameState,
    phase: GamePhase
  ): DecisionOutcome {
    const phaseOrder: GamePhase[] = [
      "tutorial",
      "order-intake",
      "production-planning",
      "execution",
      "review",
    ];
    const currentPhaseIndex = phaseOrder.indexOf(gameState.currentPhase);
    const nextPhaseIndex = currentPhaseIndex + 1;

    if (phase !== gameState.currentPhase) {
      return {
        success: false,
        points: 0,
        feedback: "Cannot complete phase that is not currently active.",
        learningPoints: [
          "Phase progression must be sequential in manufacturing planning",
        ],
        impactOnKPIs: {},
      };
    }

    // Check if phase requirements are met
    const phaseObjectives = gameState.objectives.filter(
      (obj) => obj.phase === phase
    );
    const completedObjectives = phaseObjectives.filter((obj) => obj.completed);
    const completionRate =
      phaseObjectives.length > 0
        ? completedObjectives.length / phaseObjectives.length
        : 1;

    if (completionRate < 0.8) {
      return {
        success: false,
        points: -5,
        feedback: `Phase completion requires 80% of learning objectives to be met. Currently at ${Math.round(
          completionRate * 100
        )}%.`,
        learningPoints: [
          "Thorough understanding of each phase is essential before proceeding",
        ],
        impactOnKPIs: {},
      };
    }

    const feedback = {
      tutorial:
        "Tutorial completed! You now understand the basic concepts of make-to-order manufacturing.",
      "order-intake":
        "Order intake mastered! You can effectively manage customer orders and priorities.",
      "production-planning":
        "Production planning completed! You understand resource allocation and scheduling.",
      execution:
        "Execution phase completed! You can manage production floor operations.",
      review:
        "Performance review completed! You have analyzed and learned from the manufacturing process.",
    };

    const points = {
      tutorial: 25,
      "order-intake": 50,
      "production-planning": 75,
      execution: 100,
      review: 150,
    };

    const outcome: DecisionOutcome = {
      success: true,
      points: points[phase],
      feedback: feedback[phase],
      learningPoints: [
        `Successfully completed ${phase} phase with ${Math.round(
          completionRate * 100
        )}% objective completion`,
      ],
      impactOnKPIs: {
        operationalEfficiency: nextPhaseIndex <= phaseOrder.length - 1 ? 5 : 0,
      },
    };

    return outcome;
  }

  /**
   * Educational Method: Check and update learning objective completion
   * Teaching: Progress tracking and achievement recognition
   */
  static checkLearningObjectives(gameState: GameState): GameState {
    const updatedObjectives = gameState.objectives.map((objective) => {
      if (objective.completed) return objective;

      // Check completion criteria based on objective category and player decisions
      const relevantDecisions = gameState.decisions.filter(
        (decision) => decision.phase === objective.phase
      );

      let shouldComplete = false;

      switch (objective.category) {
        case "planning":
          // Planning objectives completed through planning-related decisions
          shouldComplete = relevantDecisions.some(
            (decision) =>
              [
                "priority_changed",
                "production_scheduled",
                "route_optimized",
              ].includes(decision.decision) && decision.outcome?.success
          );
          break;

        case "execution":
          // Execution objectives completed through execution decisions
          shouldComplete = relevantDecisions.some(
            (decision) =>
              [
                "order_released",
                "quality_checked",
                "production_completed",
              ].includes(decision.decision) && decision.outcome?.success
          );
          break;

        case "customer-service":
          // Customer service objectives completed through customer-focused decisions
          shouldComplete = relevantDecisions.some(
            (decision) =>
              [
                "rush_approved",
                "delivery_promised",
                "customer_contacted",
              ].includes(decision.decision) && decision.outcome?.success
          );
          break;

        case "cost-management":
          // Cost management objectives completed through efficiency decisions
          shouldComplete = relevantDecisions.some(
            (decision) =>
              [
                "cost_optimized",
                "waste_reduced",
                "efficiency_improved",
              ].includes(decision.decision) && decision.outcome?.success
          );
          break;
      }

      // Also check for tutorial completion
      if (objective.phase === "tutorial" && gameState.tutorialCompleted) {
        shouldComplete = true;
      }

      return {
        ...objective,
        completed: shouldComplete,
      };
    });

    return {
      ...gameState,
      objectives: updatedObjectives,
    };
  }

  /**
   * Educational Method: Calculate current performance metrics
   * Teaching: KPI monitoring and performance improvement
   */
  static calculatePerformanceMetrics(
    gameState: GameState,
    orders: Order[],
    customers: Customer[]
  ): PerformanceMetrics {
    const orderMetrics = OrderService.calculateOrderMetrics(orders);
    const customerMetrics = CustomerService.calculateCustomerMetrics(customers);

    // Calculate resource utilization based on current orders and capacity
    const activeOrders = orders.filter((o) =>
      ["planning", "scheduled", "in-production"].includes(o.status)
    );
    const totalCapacityHours = gameState.currentWeek * 40 * 5; // 5 workstations, 40 hours/week
    const usedCapacityHours = activeOrders.reduce(
      (sum, order) => sum + order.estimatedDuration,
      0
    );
    const resourceUtilization =
      totalCapacityHours > 0
        ? (usedCapacityHours / totalCapacityHours) * 100
        : 0;

    // Calculate quality score based on completed orders
    const completedOrders = orders.filter((o) =>
      ["completed-on-time", "completed-late", "delivered"].includes(o.status)
    );
    const qualityScore =
      completedOrders.length > 0
        ? completedOrders.reduce(
            (sum, order) => sum + (order.qualityScore || 85),
            0
          ) / completedOrders.length
        : 85;

    // Calculate cost efficiency (profit margin to cost ratio)
    const costEfficiency = orderMetrics.averageProfitMargin;

    return {
      week: gameState.currentWeek,
      customerSatisfaction: customerMetrics.averageSatisfactionScore,
      onTimeDelivery: orderMetrics.onTimeDeliveryRate,
      profitMargin: orderMetrics.averageProfitMargin,
      resourceUtilization: Math.min(100, resourceUtilization),
      qualityScore,
      costEfficiency,
    };
  }

  /**
   * Educational Method: Advance game to next week
   * Teaching: Time management and weekly performance cycles
   */
  static advanceWeek(
    gameState: GameState,
    orders: Order[],
    customers: Customer[]
  ): {
    updatedGameState: GameState;
    weeklyReport: {
      metrics: PerformanceMetrics;
      events: string[];
      learningInsights: string[];
    };
  } {
    const newWeek = gameState.currentWeek + 1;
    const metrics = this.calculatePerformanceMetrics(
      gameState,
      orders,
      customers
    );

    // Generate weekly events based on performance
    const events: string[] = [];
    const learningInsights: string[] = [];

    if (metrics.onTimeDelivery < 80) {
      events.push("Customer complained about late deliveries");
      learningInsights.push(
        "On-time delivery is crucial for customer satisfaction in make-to-order manufacturing"
      );
    }

    if (metrics.resourceUtilization > 95) {
      events.push("Production floor is at maximum capacity");
      learningInsights.push(
        "High utilization can lead to bottlenecks and quality issues"
      );
    } else if (metrics.resourceUtilization < 60) {
      events.push("Production capacity is underutilized");
      learningInsights.push(
        "Low utilization affects profitability - consider marketing efforts"
      );
    }

    if (metrics.profitMargin < 15) {
      events.push("Profit margins are below target");
      learningInsights.push(
        "Consider reviewing pricing strategy or reducing costs"
      );
    }

    // Update game state
    const updatedGameState: GameState = {
      ...gameState,
      currentWeek: newWeek,
      customerSatisfactionAvg: metrics.customerSatisfaction,
      operationalEfficiency: metrics.resourceUtilization,
    };

    return {
      updatedGameState,
      weeklyReport: {
        metrics,
        events,
        learningInsights,
      },
    };
  }

  /**
   * Educational Method: Generate hint for current situation
   * Teaching: Contextual guidance and learning support
   */
  static generateHint(
    gameState: GameState,
    orders: Order[],
    currentContext: string
  ): string {
    if (!gameState.hintsEnabled) {
      return "";
    }

    const urgentOrders = orders.filter(
      (o) => o.priority === "urgent" && o.status === "submitted"
    );
    const overdueOrders = orders.filter(
      (o) =>
        new Date(o.dueDate) < new Date() &&
        !["completed-on-time", "completed-late", "delivered"].includes(o.status)
    );

    switch (currentContext) {
      case "order-review":
        if (urgentOrders.length > 0) {
          return `💡 Hint: You have ${urgentOrders.length} urgent order(s) that need immediate attention. Prioritize these to maintain customer satisfaction.`;
        }
        if (overdueOrders.length > 0) {
          return `⚠️ Hint: ${overdueOrders.length} order(s) are overdue. Consider rush processing or customer communication.`;
        }
        return "💡 Hint: Review orders by priority and due date. Consider capacity constraints when approving orders.";

      case "production-planning":
        const unscheduledOrders = orders.filter((o) => o.status === "approved");
        if (unscheduledOrders.length > 5) {
          return "💡 Hint: Many approved orders are waiting for scheduling. Consider capacity planning and route optimization.";
        }
        return "💡 Hint: Balance workload across production routes and consider setup time when scheduling.";

      case "customer-service":
        if (gameState.customerSatisfactionAvg < 70) {
          return "💡 Hint: Customer satisfaction is low. Focus on on-time delivery and quality to improve relationships.";
        }
        return "💡 Hint: Proactive customer communication helps manage expectations and build trust.";

      default:
        return "💡 Hint: Use the dashboard metrics to identify areas needing attention. Focus on learning objectives for your current phase.";
    }
  }
}

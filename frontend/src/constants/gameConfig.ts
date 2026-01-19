/**
 * Game Configuration Constants for Make2Manage Educational Game
 * Educational Focus: Centralized settings for manufacturing simulation scenarios
 */

import type {
  GameConfiguration,
  DifficultyLevel,
  GamePhase,
} from "../types/game";

/**
 * Educational Difficulty Levels
 * Teaching: Progressive complexity in manufacturing scenarios
 */
export const DIFFICULTY_LEVELS: Record<
  DifficultyLevel,
  {
    name: string;
    description: string;
    settings: {
      orderComplexity: number; // 1-5 scale
      customerDemands: number; // 1-5 scale
      marketVolatility: number; // 1-5 scale
      timePreassure: number; // 1-5 scale
      assistanceLevel: "none" | "hints" | "guided";
    };
    unlocks: string[];
  }
> = {
  beginner: {
    name: "Beginner",
    description:
      "Learn basic concepts with guided assistance and simple scenarios",
    settings: {
      orderComplexity: 2,
      customerDemands: 2,
      marketVolatility: 1,
      timePreassure: 2,
      assistanceLevel: "guided",
    },
    unlocks: ["tutorial", "order-intake", "basic-planning"],
  },
  intermediate: {
    name: "Intermediate",
    description:
      "Apply knowledge with moderate complexity and occasional hints",
    settings: {
      orderComplexity: 3,
      customerDemands: 3,
      marketVolatility: 3,
      timePreassure: 3,
      assistanceLevel: "hints",
    },
    unlocks: ["production-planning", "execution", "customer-management"],
  },
  advanced: {
    name: "Advanced",
    description: "Master manufacturing management with realistic complexity",
    settings: {
      orderComplexity: 5,
      customerDemands: 4,
      marketVolatility: 4,
      timePreassure: 4,
      assistanceLevel: "none",
    },
    unlocks: ["advanced-scenarios", "crisis-management", "optimization"],
  },
};

/**
 * Educational Game Phases Configuration
 * Teaching: Structured learning progression through manufacturing processes
 */
export const GAME_PHASES: Record<
  GamePhase,
  {
    name: string;
    description: string;
    objectives: string[];
    estimatedDuration: number; // minutes
    requiredScore: number;
    unlocks: GamePhase[];
  }
> = {
  tutorial: {
    name: "Tutorial",
    description: "Introduction to make-to-order manufacturing concepts",
    objectives: [
      "Understand customer order lifecycle",
      "Learn production planning basics",
      "Identify key performance indicators",
    ],
    estimatedDuration: 15,
    requiredScore: 50,
    unlocks: ["order-intake"],
  },
  "order-intake": {
    name: "Order Intake & Management",
    description: "Master customer order evaluation and prioritization",
    objectives: [
      "Evaluate customer orders for profitability",
      "Set appropriate priorities based on business rules",
      "Balance customer satisfaction with operational efficiency",
    ],
    estimatedDuration: 25,
    requiredScore: 200,
    unlocks: ["production-planning"],
  },
  "production-planning": {
    name: "Production Planning",
    description: "Learn resource allocation and production scheduling",
    objectives: [
      "Optimize production schedules for efficiency",
      "Manage capacity constraints effectively",
      "Coordinate multiple production routes",
    ],
    estimatedDuration: 30,
    requiredScore: 400,
    unlocks: ["execution"],
  },
  execution: {
    name: "Production Execution",
    description: "Manage production floor operations and quality control",
    objectives: [
      "Monitor production progress in real-time",
      "Handle unexpected disruptions and changes",
      "Maintain quality standards under pressure",
    ],
    estimatedDuration: 35,
    requiredScore: 650,
    unlocks: ["review"],
  },
  review: {
    name: "Performance Review",
    description: "Analyze performance and identify improvement opportunities",
    objectives: [
      "Interpret key performance indicators",
      "Identify root causes of performance issues",
      "Develop improvement strategies",
    ],
    estimatedDuration: 20,
    requiredScore: 900,
    unlocks: [],
  },
};

/**
 * Default Game Configuration for Different Scenarios
 * Teaching: Standard manufacturing parameters and realistic constraints
 */
export const DEFAULT_GAME_CONFIG: Record<string, GameConfiguration> = {
  tutorial: {
    difficultyLevel: "beginner",
    startingCash: 100000,
    baseReputation: 75,
    maxOrderValue: 50000,
    rushOrderMultiplier: 1.5,
    lateDeliveryPenalty: 0.1,
    phases: ["tutorial", "order-intake"],
    totalWeeks: 4,
    weekDurationMs: 30000, // 30 seconds per week for tutorial
    learningObjectives: [], // Will be populated from LEARNING_OBJECTIVES
    enableRealTimeGuidance: true,
    enablePerformanceFeedback: true,
    customerTypes: ["individual", "small-business"],
    productComplexityLevels: [1, 2],
    marketVolatility: "low",
  },

  standard: {
    difficultyLevel: "intermediate",
    startingCash: 250000,
    baseReputation: 70,
    maxOrderValue: 200000,
    rushOrderMultiplier: 1.8,
    lateDeliveryPenalty: 0.15,
    phases: [
      "tutorial",
      "order-intake",
      "production-planning",
      "execution",
      "review",
    ],
    totalWeeks: 12,
    weekDurationMs: 60000, // 1 minute per week
    learningObjectives: [], // Will be populated from LEARNING_OBJECTIVES
    enableRealTimeGuidance: true,
    enablePerformanceFeedback: true,
    customerTypes: ["individual", "small-business", "enterprise"],
    productComplexityLevels: [1, 2, 3, 4],
    marketVolatility: "medium",
  },

  expert: {
    difficultyLevel: "advanced",
    startingCash: 500000,
    baseReputation: 65,
    maxOrderValue: 1000000,
    rushOrderMultiplier: 2.0,
    lateDeliveryPenalty: 0.2,
    phases: [
      "tutorial",
      "order-intake",
      "production-planning",
      "execution",
      "review",
    ],
    totalWeeks: 20,
    weekDurationMs: 120000, // 2 minutes per week
    learningObjectives: [], // Will be populated from LEARNING_OBJECTIVES
    enableRealTimeGuidance: false,
    enablePerformanceFeedback: true,
    customerTypes: ["small-business", "enterprise", "government"],
    productComplexityLevels: [2, 3, 4, 5],
    marketVolatility: "high",
  },
};

/**
 * Production Configuration Constants
 * Teaching: Manufacturing capacity and operational parameters
 */
export const PRODUCTION_CONFIG = {
  // Standard working parameters
  WORKING_HOURS_PER_DAY: 8,
  WORKING_DAYS_PER_WEEK: 5,
  SHIFTS_PER_DAY: 1,

  // Capacity and efficiency
  BASE_EFFICIENCY: 1.0,
  MAX_EFFICIENCY: 1.5,
  MIN_EFFICIENCY: 0.6,
  OVERTIME_EFFICIENCY_PENALTY: 0.85,

  // Quality and rework parameters
  BASE_QUALITY_RATE: 0.95,
  REWORK_TIME_MULTIPLIER: 0.3,
  QUALITY_INSPECTION_TIME: 0.1, // 10% of production time

  // Setup and changeover times (hours)
  SETUP_TIMES: {
    R01: 0.5, // Route 1: Simple assembly
    R02: 1.0, // Route 2: Machining
    R03: 1.5, // Route 3: Complex fabrication
    R04: 0.75, // Route 4: Finishing
    R05: 2.0, // Route 5: Custom manufacturing
  },

  // Route capacities (orders per day)
  ROUTE_CAPACITIES: {
    R01: 8,
    R02: 6,
    R03: 4,
    R04: 10,
    R05: 2,
  },
};

/**
 * Financial Configuration Constants
 * Teaching: Manufacturing economics and cost structures
 */
export const FINANCIAL_CONFIG = {
  // Cost parameters
  LABOR_RATE_PER_HOUR: 45,
  OVERHEAD_RATE: 0.3, // 30% of direct labor
  MATERIAL_COST_PERCENTAGE: 0.4, // 40% of order value typically

  // Pricing and margins
  TARGET_PROFIT_MARGIN: 0.2, // 20%
  MINIMUM_PROFIT_MARGIN: 0.05, // 5%
  RUSH_ORDER_MARKUP: 0.25, // 25% premium

  // Credit and payment terms
  STANDARD_PAYMENT_TERMS: 30, // days
  CREDIT_LIMIT_MULTIPLIER: 5, // 5x average order value
  BAD_DEBT_ALLOWANCE: 0.02, // 2% of credit exposure

  // Currency formatting
  DEFAULT_CURRENCY: "USD",
  CURRENCY_PRECISION: 2,
};

/**
 * Customer Configuration Templates
 * Teaching: Customer segmentation and relationship management
 */
export const CUSTOMER_TEMPLATES = {
  vip: {
    creditLimitMultiplier: 10,
    discountLevel: 0.1,
    priorityBonus: 2,
    supportLevel: "dedicated",
    paymentTerms: 45,
  },
  premium: {
    creditLimitMultiplier: 7,
    discountLevel: 0.05,
    priorityBonus: 1,
    supportLevel: "priority",
    paymentTerms: 30,
  },
  standard: {
    creditLimitMultiplier: 3,
    discountLevel: 0.0,
    priorityBonus: 0,
    supportLevel: "standard",
    paymentTerms: 30,
  },
};

/**
 * Performance Thresholds and Targets
 * Teaching: Manufacturing KPIs and benchmarking
 */
export const PERFORMANCE_TARGETS = {
  // Delivery performance
  ON_TIME_DELIVERY_TARGET: 95, // percentage
  ON_TIME_DELIVERY_WARNING: 85,
  ON_TIME_DELIVERY_CRITICAL: 75,

  // Quality performance
  QUALITY_TARGET: 98, // percentage
  QUALITY_WARNING: 95,
  QUALITY_CRITICAL: 90,

  // Efficiency targets
  CAPACITY_UTILIZATION_TARGET: 85, // percentage
  CAPACITY_UTILIZATION_MIN: 60,
  CAPACITY_UTILIZATION_MAX: 95,

  // Customer satisfaction
  CUSTOMER_SATISFACTION_TARGET: 90, // percentage
  CUSTOMER_SATISFACTION_WARNING: 80,
  CUSTOMER_SATISFACTION_CRITICAL: 70,

  // Financial performance
  PROFIT_MARGIN_TARGET: 20, // percentage
  PROFIT_MARGIN_WARNING: 15,
  PROFIT_MARGIN_CRITICAL: 10,
};

/**
 * Educational Scoring System
 * Teaching: Performance measurement and continuous improvement
 */
export const SCORING_CONFIG = {
  // Base points for decisions
  DECISION_POINTS: {
    order_approved: 10,
    order_rejected: 5,
    priority_changed: 8,
    rush_approved: 15,
    delivery_promised: 12,
    quality_check_passed: 20,
    on_time_delivery: 25,
    customer_satisfaction_high: 30,
  },

  // Penalty points
  PENALTY_POINTS: {
    late_delivery: -15,
    quality_issue: -20,
    customer_complaint: -25,
    over_budget: -10,
    missed_deadline: -30,
  },

  // Bonus multipliers
  BONUS_MULTIPLIERS: {
    perfect_week: 1.5,
    efficiency_improvement: 1.3,
    cost_reduction: 1.2,
    innovation: 2.0,
  },

  // Score thresholds
  GRADE_THRESHOLDS: {
    A: 900,
    B: 700,
    C: 500,
    D: 300,
    F: 0,
  },
};

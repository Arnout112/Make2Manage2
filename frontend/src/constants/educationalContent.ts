/**
 * Educational Content Constants for Make2Manage Learning Game
 * Educational Focus: Learning objectives, scenarios, and instructional content
 */

import type { LearningObjective, GamePhase } from "../types/game";

/**
 * Learning Objectives by Phase
 * Teaching: Structured progression through manufacturing management concepts
 */
export const LEARNING_OBJECTIVES: Record<GamePhase, LearningObjective[]> = {
  tutorial: [
    {
      id: "TUTORIAL_001",
      title: "Understand Order Lifecycle",
      description:
        "Learn the complete journey of a customer order from intake to delivery",
      phase: "tutorial",
      completed: false,
      points: 25,
      category: "planning",
      requiredFor: ["ORDER_INTAKE_001"],
    },
    {
      id: "TUTORIAL_002",
      title: "Identify Key Stakeholders",
      description:
        "Recognize the roles of customers, sales, production, and quality teams",
      phase: "tutorial",
      completed: false,
      points: 20,
      category: "customer-service",
      requiredFor: ["ORDER_INTAKE_002"],
    },
    {
      id: "TUTORIAL_003",
      title: "Navigate the Dashboard",
      description: "Master the game interface and key performance indicators",
      phase: "tutorial",
      completed: false,
      points: 15,
      category: "planning",
      requiredFor: [],
    },
  ],

  "order-intake": [
    {
      id: "ORDER_INTAKE_001",
      title: "Order Evaluation Mastery",
      description:
        "Successfully evaluate 10 orders considering profitability, capacity, and customer tier",
      phase: "order-intake",
      completed: false,
      points: 50,
      category: "planning",
      requiredFor: ["PRODUCTION_001"],
    },
    {
      id: "ORDER_INTAKE_002",
      title: "Priority Setting Excellence",
      description:
        "Demonstrate understanding of priority setting based on business rules",
      phase: "order-intake",
      completed: false,
      points: 40,
      category: "customer-service",
      requiredFor: ["PRODUCTION_002"],
    },
    {
      id: "ORDER_INTAKE_003",
      title: "Customer Communication",
      description:
        "Handle 5 customer interactions maintaining satisfaction above 80%",
      phase: "order-intake",
      completed: false,
      points: 35,
      category: "customer-service",
      requiredFor: [],
    },
    {
      id: "ORDER_INTAKE_004",
      title: "Profitability Analysis",
      description:
        "Reject unprofitable orders while maintaining customer relationships",
      phase: "order-intake",
      completed: false,
      points: 45,
      category: "cost-management",
      requiredFor: ["PRODUCTION_003"],
    },
  ],

  "production-planning": [
    {
      id: "PRODUCTION_001",
      title: "Capacity Planning Fundamentals",
      description:
        "Create production schedules that achieve 80%+ capacity utilization",
      phase: "production-planning",
      completed: false,
      points: 60,
      category: "planning",
      requiredFor: ["EXECUTION_001"],
    },
    {
      id: "PRODUCTION_002",
      title: "Route Optimization",
      description:
        "Optimize production routes to minimize setup times and maximize efficiency",
      phase: "production-planning",
      completed: false,
      points: 55,
      category: "planning",
      requiredFor: ["EXECUTION_002"],
    },
    {
      id: "PRODUCTION_003",
      title: "Constraint Management",
      description: "Identify and manage production bottlenecks effectively",
      phase: "production-planning",
      completed: false,
      points: 65,
      category: "execution",
      requiredFor: ["EXECUTION_003"],
    },
    {
      id: "PRODUCTION_004",
      title: "Schedule Flexibility",
      description:
        "Adapt production schedules to handle rush orders without major disruption",
      phase: "production-planning",
      completed: false,
      points: 50,
      category: "planning",
      requiredFor: [],
    },
  ],

  execution: [
    {
      id: "EXECUTION_001",
      title: "Real-time Monitoring",
      description:
        "Maintain 95%+ on-time delivery through effective production monitoring",
      phase: "execution",
      completed: false,
      points: 70,
      category: "execution",
      requiredFor: ["REVIEW_001"],
    },
    {
      id: "EXECUTION_002",
      title: "Quality Control",
      description:
        "Achieve 98%+ quality rate while maintaining production targets",
      phase: "execution",
      completed: false,
      points: 65,
      category: "execution",
      requiredFor: ["REVIEW_002"],
    },
    {
      id: "EXECUTION_003",
      title: "Crisis Management",
      description:
        "Successfully handle production disruptions with minimal impact",
      phase: "execution",
      completed: false,
      points: 80,
      category: "execution",
      requiredFor: [],
    },
    {
      id: "EXECUTION_004",
      title: "Continuous Improvement",
      description:
        "Implement process improvements that increase efficiency by 10%",
      phase: "execution",
      completed: false,
      points: 75,
      category: "cost-management",
      requiredFor: ["REVIEW_003"],
    },
  ],

  review: [
    {
      id: "REVIEW_001",
      title: "Performance Analysis",
      description:
        "Accurately interpret KPIs and identify improvement opportunities",
      phase: "review",
      completed: false,
      points: 60,
      category: "planning",
      requiredFor: [],
    },
    {
      id: "REVIEW_002",
      title: "Root Cause Analysis",
      description:
        "Identify root causes of performance issues and develop solutions",
      phase: "review",
      completed: false,
      points: 70,
      category: "planning",
      requiredFor: [],
    },
    {
      id: "REVIEW_003",
      title: "Strategic Planning",
      description: "Develop improvement strategies based on performance data",
      phase: "review",
      completed: false,
      points: 80,
      category: "cost-management",
      requiredFor: [],
    },
  ],
};

/**
 * Educational Scenarios and Case Studies
 * Teaching: Real-world manufacturing situations and decision-making
 */
export const EDUCATIONAL_SCENARIOS = {
  rushOrderDilemma: {
    id: "SCENARIO_001",
    title: "The Rush Order Dilemma",
    description:
      "A VIP customer requests a rush order that would disrupt your carefully planned schedule.",
    phase: "order-intake",
    situation: `
      Your largest customer, TechCorp (VIP tier), has submitted an urgent order worth $75,000. 
      They need it completed in 3 days instead of the usual 7-day lead time. 
      Accepting this order would require overtime and might delay 2 other orders.
    `,
    learningGoals: [
      "Understand the impact of rush orders on operations",
      "Balance customer satisfaction with operational efficiency",
      "Calculate the true cost of rush production",
    ],
    decisionPoints: [
      "Accept the rush order with premium pricing",
      "Negotiate a compromise delivery date",
      "Reject the order to maintain schedule integrity",
      "Accept but communicate delays to other customers",
    ],
    optimalOutcome:
      "Accept with premium pricing and proactive customer communication",
    educationalNotes: `
      Rush orders are common in make-to-order manufacturing but must be carefully managed.
      Key considerations include:
      - True cost calculation (overtime, setup changes, delays)
      - Customer relationship value and future business
      - Impact on other customers and overall reputation
      - Operational capacity and flexibility
    `,
  },

  qualityVsSpeed: {
    id: "SCENARIO_002",
    title: "Quality vs Speed Trade-off",
    description:
      "Production is behind schedule and the team suggests skipping detailed quality checks.",
    phase: "execution",
    situation: `
      Week 8 has been challenging with equipment issues and staff shortages. 
      You're behind on 4 orders and the production team suggests reducing quality inspection time 
      to catch up. Historical data shows this increases defect rate from 2% to 8%.
    `,
    learningGoals: [
      "Understand the relationship between speed and quality",
      "Calculate the cost of quality failures",
      "Make decisions under pressure while maintaining standards",
    ],
    decisionPoints: [
      "Maintain full quality checks and accept delays",
      "Reduce quality checks to meet deadlines",
      "Work overtime to maintain both quality and schedule",
      "Negotiate delivery extensions with affected customers",
    ],
    optimalOutcome:
      "Maintain quality standards while working overtime and communicating with customers",
    educationalNotes: `
      Quality should never be compromised for speed in manufacturing.
      Poor quality leads to:
      - Customer complaints and returns
      - Warranty costs and rework
      - Damaged reputation and lost future business
      - Regulatory issues in some industries
    `,
  },

  capacityChallenge: {
    id: "SCENARIO_003",
    title: "Capacity Planning Challenge",
    description:
      "Multiple large orders arrive simultaneously, exceeding your normal capacity.",
    phase: "production-planning",
    situation: `
      Three enterprise customers have submitted large orders totaling $300,000 in value.
      Combined, these orders require 240 hours of production time, but you only have 
      180 hours of capacity available in the requested timeframe.
    `,
    learningGoals: [
      "Master capacity analysis and constraint identification",
      "Explore creative solutions for capacity challenges",
      "Balance customer needs with operational reality",
    ],
    decisionPoints: [
      "Accept all orders and work extensive overtime",
      "Reject the least profitable order",
      "Negotiate staggered delivery dates",
      "Outsource some production to partners",
    ],
    optimalOutcome:
      "Negotiate delivery schedules and consider selective outsourcing",
    educationalNotes: `
      Capacity constraints are fundamental in make-to-order manufacturing.
      Options for managing capacity include:
      - Flexible delivery scheduling
      - Overtime and temporary staffing
      - Outsourcing and partnerships
      - Capacity investment for future growth
    `,
  },
};

/**
 * Educational Tips and Best Practices
 * Teaching: Manufacturing wisdom and professional guidance
 */
export const EDUCATIONAL_TIPS = {
  orderManagement: [
    "Always confirm order details with customers before starting production",
    "Consider customer lifetime value, not just individual order profitability",
    "Build buffer time into delivery promises to account for unexpected issues",
    "Prioritize orders based on due date, customer tier, and profitability combined",
    "Communicate proactively with customers about any potential delays",
  ],

  productionPlanning: [
    "Group similar orders together to minimize setup times",
    "Keep capacity utilization between 80-90% for optimal efficiency",
    "Plan for quality inspection time in your production schedules",
    "Always have backup plans for critical production routes",
    "Consider seasonal patterns and customer ordering cycles",
  ],

  customerService: [
    "Underpromise and overdeliver on delivery commitments",
    "Maintain detailed records of all customer interactions",
    "Address customer complaints within 24 hours",
    "Regular customer check-ins help prevent small issues from becoming big problems",
    "VIP customers deserve special attention but not at the expense of fairness",
  ],

  qualityControl: [
    "Prevent defects rather than inspecting them out",
    "Train operators on quality standards and give them authority to stop production",
    "Track quality metrics by operator, shift, and production route",
    "Customer returns are 10x more expensive than catching defects internally",
    "Quality issues compound - fix root causes, not just symptoms",
  ],

  financialManagement: [
    "Monitor cash flow weekly - profitability means nothing without cash",
    "Understand the difference between markup and margin",
    "Track actual vs. estimated costs to improve future bidding",
    "Bad debt prevention is better than debt collection",
    "Small improvements in efficiency have big impacts on profitability",
  ],
};

/**
 * Contextual Help Content
 * Teaching: Just-in-time learning support
 */
export const CONTEXTUAL_HELP = {
  "order-approval": {
    title: "Order Approval Guidelines",
    content: `
      When evaluating orders for approval, consider:
      
      ✅ **Financial Factors:**
      - Profit margin meets minimum thresholds (typically 15%+)
      - Customer credit limit and payment history
      - Total order value vs. capacity investment required
      
      ✅ **Operational Factors:**
      - Available production capacity
      - Required delivery date vs. current schedule
      - Special requirements or complexity
      
      ✅ **Strategic Factors:**
      - Customer relationship value and potential
      - Market positioning and competitive advantage
      - Learning opportunities for your team
    `,
    tips: [
      "Reject orders with less than 5% margin unless strategic",
      "VIP customers get priority but not unlimited flexibility",
      "Document rejection reasons for future reference",
    ],
  },

  "priority-setting": {
    title: "Order Priority Guidelines",
    content: `
      Set order priorities using this hierarchy:
      
      🔴 **Urgent:** Customer-critical deadlines, high-value rush orders
      🟡 **High:** VIP customer orders, profitable standard orders with tight timelines
      🟢 **Normal:** Standard orders with reasonable timelines
      ⚪ **Low:** Orders with flexible deadlines, low-margin work
      
      Remember: Too many urgent orders means poor planning!
    `,
    tips: [
      "No more than 20% of orders should be urgent",
      "Priority changes disrupt schedules - use sparingly",
      "Communicate priority rationale to production team",
    ],
  },

  "capacity-planning": {
    title: "Capacity Planning Best Practices",
    content: `
      Effective capacity planning requires:
      
      📊 **Demand Analysis:**
      - Historical order patterns
      - Seasonal variations
      - Customer forecasts and commitments
      
      ⚙️ **Capacity Assessment:**
      - Equipment availability and condition
      - Staffing levels and skills
      - Setup and changeover times
      
      📈 **Optimization Strategies:**
      - Route efficiency improvements
      - Batch sizing for similar orders
      - Preventive maintenance scheduling
    `,
    tips: [
      "Plan for 85% utilization maximum for flexibility",
      "Always have backup plans for critical bottlenecks",
      "Invest in cross-training to increase flexibility",
    ],
  },
};

/**
 * Achievement Definitions
 * Teaching: Recognition and motivation for learning milestones
 */
export const ACHIEVEMENTS = {
  "perfect-week": {
    name: "Perfect Week",
    description:
      "Complete a week with 100% on-time delivery and 95%+ customer satisfaction",
    icon: "🏆",
    points: 100,
    rarity: "rare",
  },
  "efficiency-expert": {
    name: "Efficiency Expert",
    description: "Achieve 90%+ capacity utilization for 3 consecutive weeks",
    icon: "⚡",
    points: 75,
    rarity: "uncommon",
  },
  "customer-champion": {
    name: "Customer Champion",
    description:
      "Maintain 90%+ customer satisfaction across all customer tiers",
    icon: "🤝",
    points: 80,
    rarity: "uncommon",
  },
  "quality-master": {
    name: "Quality Master",
    description: "Achieve 99%+ quality rate for 5 consecutive orders",
    icon: "✨",
    points: 90,
    rarity: "rare",
  },
  "profit-optimizer": {
    name: "Profit Optimizer",
    description: "Maintain 25%+ profit margin for 10 consecutive orders",
    icon: "💰",
    points: 85,
    rarity: "uncommon",
  },
  "crisis-manager": {
    name: "Crisis Manager",
    description:
      "Successfully handle 3 production disruptions without missing deliveries",
    icon: "🚀",
    points: 120,
    rarity: "legendary",
  },
};

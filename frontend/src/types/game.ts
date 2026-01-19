/**
 * Core Game Types for Make2Manage Educational Game
 * Teaching: Manufacturing Planning & Control in Make-to-Order Production
 */

export type GamePhase =
  | "tutorial" // Introduction and basic concepts
  | "order-intake" // Customer order management
  | "production-planning" // Resource planning and scheduling
  | "execution" // Production floor management
  | "review"; // Performance analysis and learning

export type PlayerRole =
  | "sales-manager" // Focuses on customer relationships and order intake
  | "production-planner" // Focuses on scheduling and resource allocation
  | "operations-manager"; // Oversees entire production process

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface LearningObjective {
  id: string;
  title: string;
  description: string;
  phase: GamePhase;
  completed: boolean;
  points: number;
  category: "planning" | "execution" | "customer-service" | "cost-management";
  requiredFor?: string[]; // IDs of objectives that depend on this one
}

export interface PlayerDecision {
  id: string;
  timestamp: Date;
  phase: GamePhase;
  playerId: string;
  decision: string;
  context: Record<string, any>;
  outcome?: DecisionOutcome;
  timeToDecide?: number; // milliseconds
}

export interface DecisionOutcome {
  success: boolean;
  points: number;
  feedback: string;
  learningPoints: string[];
  impactOnKPIs: {
    customerSatisfaction?: number;
    operationalEfficiency?: number;
    profitability?: number;
    reputation?: number;
  };
}

export interface GameState {
  // Game Meta Information
  gameId: string;
  currentPhase: GamePhase;
  playerRole: PlayerRole;
  difficultyLevel: DifficultyLevel;
  startTime: Date;
  endTime?: Date;

  // Learning Progress
  objectives: LearningObjective[];
  decisions: PlayerDecision[];
  totalScore: number;

  // Company Performance Metrics
  companyCash: number;
  companyReputation: number;
  customerSatisfactionAvg: number;
  operationalEfficiency: number;

  // Game Configuration
  currentWeek: number;
  totalWeeks: number;
  timeMultiplier: number; // How fast the game runs compared to real time

  // Educational Features
  hintsEnabled: boolean;
  tutorialCompleted: boolean;
  assistanceLevel: "none" | "hints" | "guided";
}

export interface GameConfiguration {
  // Financial Settings
  startingCash: number;
  baseReputation: number;
  maxOrderValue: number;
  rushOrderMultiplier: number;
  lateDeliveryPenalty: number;

  // Game Flow
  phases: GamePhase[];
  totalWeeks: number;
  weekDurationMs: number;

  // Educational Settings
  difficultyLevel: DifficultyLevel;
  learningObjectives: LearningObjective[];
  enableRealTimeGuidance: boolean;
  enablePerformanceFeedback: boolean;

  // Scenario Settings
  customerTypes: string[];
  productComplexityLevels: number[];
  marketVolatility: "low" | "medium" | "high";
}

export interface GameSession {
  sessionId: string;
  gameState: GameState;
  configuration: GameConfiguration;
  participants: Player[];
  isActive: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  email?: string;
  progress: {
    score: number;
    completedObjectives: string[];
    currentPhase: GamePhase;
    timeSpent: number; // minutes
  };
  preferences: {
    assistanceLevel: "none" | "hints" | "guided";
    notifications: boolean;
    soundEnabled: boolean;
  };
}

// Educational Analytics Types
export interface LearningAnalytics {
  playerId: string;
  sessionId: string;
  timeSpent: number;
  decisionsCount: number;
  correctDecisions: number;
  avgDecisionTime: number;
  objectivesCompleted: number;
  finalScore: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendedNext: string[];
}

export interface PerformanceMetrics {
  week: number;
  customerSatisfaction: number;
  onTimeDelivery: number;
  profitMargin: number;
  resourceUtilization: number;
  qualityScore: number;
  costEfficiency: number;
}

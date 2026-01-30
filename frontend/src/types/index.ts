// Data Models for Make-to-Order Learning Game

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  priority: "low" | "normal" | "high" | "urgent";
  orderValue: number; // Order value in currency
  dueDate?: Date;
  // New: in-game due time measured in minutes from game start
  dueGameMinutes?: number;
  route: number[];
  currentStepIndex: number;
  status:
    | "queued"
    | "processing"
    | "done"
    | "error"
    | "completed-on-time"
    | "completed-late"
    | "on-hold"; // allow paused/on-hold status for manual interventions
  // allow paused/on-hold status for manual interventions
  // (some other order schemas also use "on-hold")
  // Note: older richer Order types also declare "on-hold".
  timestamps: { deptId: number; start: Date; end?: Date }[];
  reworkCount: number;
  createdAt: Date;
  processingTime?: number; // Total time needed for current step (milliseconds)
  processingTimeRemaining?: number; // Time remaining for current step (milliseconds)
  actualLeadTime?: number; // Actual completion time
  slaStatus?: "on-track" | "at-risk" | "overdue";
  completedAt?: Date;
  currentDepartment?: number;
  currentOperationIndex?: number; // For tracking multi-step department operations
  operationProgress?: OperationProgress[]; // Track progress through department operations
  specialInstructions?: string; // Special handling requirements
  rushOrder?: boolean; // Rush order flag
  scheduledStartTime?: Date; // Scheduled start time for capacity planning
  isHalfOrder?: boolean; // Half orders require only 50% of normal processing time
  halfOrderReason?:
    | "defect_repair"
    | "partial_work"
    | "rework"
    | "quality_issue"; // Reason for half order
  processingTimeMultiplier?: number; // Multiplier for processing time (0.5 for half orders, 1.0 for normal)
  perDeptProcessingTimes?: Record<number, number>; // Optional per-department authored processing times (milliseconds)
}

export interface OperationProgress {
  operationId: string;
  operationName: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  completed: boolean;
}

export type PriorityRule = "FIFO" | "EDD" | "SPT";

export interface Department {
  id: number;
  name: string;
  queue: Order[];
  inProcess?: Order;
  operatingTime: number; // Total operating time in milliseconds
  utilization: number; // Percentage of time department is busy (0-100%)
  avgCycleTime: number;
  totalProcessed: number;
  capacity: number; // Max orders that can be processed simultaneously
  efficiency: number; // Worker efficiency multiplier (0.8 - 1.2)
  equipmentCondition: number; // Equipment reliability (0.95 - 1.0)
  status: "available" | "busy" | "overloaded" | "maintenance";
  operations: DepartmentOperation[]; // List of operations this department performs
  standardProcessingTime: number; // Standard time for all operations (milliseconds)
  currentOperationIndex?: number; // For multi-step departments
  priorityRule: PriorityRule; // Priority rule for this department (FIFO, EDD, SPT)
  maxQueueSize: number; // Maximum queue capacity for this department
  wipCount: number; // Current Work-in-Progress count (queue + inProcess)
}

export interface DepartmentOperation {
  id: string;
  name: string;
  duration: number; // Duration in milliseconds
  description: string;
}

// R01-R03: Customer management interfaces
export interface Customer {
  id: string;
  name: string;
  tier: "standard" | "premium" | "vip"; // Customer tier affects priority
  contactEmail: string;
  totalOrders: number;
  onTimeDeliveryRate: number; // Historical performance
  averageOrderValue: number;
}

export type CustomerFilter =
  | "all"
  | "completed"
  | "rejected"
  | "high-priority"
  | "rush-orders"
  | "by-customer";
export type OrderPriority = "low" | "normal" | "high" | "urgent";
export type StatisticsFilter =
  | "order-doorlooptijd"
  | "doorlooptijd-per-werkplek"
  | "orderdoorlooptijd-per-afdeling";
export type ScreenType =
  | "landing"
  | "level-select"
  | "game"
  | "analytics"
  | "manual-game"
  | "end-game"
  | "scoreboard";
export type NavigationScreen = "game" | "analytics" | "manual-game" | "end-game";

// Game Session Management
export interface GameSession {
  id: string;
  duration: number; // Session duration in milliseconds
  startTime?: Date;
  endTime?: Date;
  status: "setup" | "running" | "paused" | "completed";
  settings: GameSettings;
  elapsedTime: number; // Time elapsed in milliseconds
}

export interface GameSettings {
  sessionDuration: 15 | 30 | 60; // minutes - 15min, 30min, 1hr options
  orderGenerationRate: "low" | "medium" | "high";
  complexityLevel: "beginner" | "intermediate" | "advanced";
  randomSeed?: string; // for reproducible scenarios
  gameSpeed: 1 | 2 | 4 | 8; // Speed multiplier - speed control
  enableEvents: boolean; // equipment failure, delivery delays
  enableAdvancedRouting: boolean; // advanced routing logic
  manualMode: boolean; // Educational mode: disable automatic processing, require student decisions
  difficultyPreset?: "easy" | "medium" | "hard"; // Simple difficulty presets
  // When true, the game will use the provided `predeterminedScheduledOrders`
  // instead of runtime-generating new orders. Useful for level-based scenarios.
  usePredeterminedOrders?: boolean;
  // If `usePredeterminedOrders` is true, these scheduled orders (with ms `releaseTime`)
  // will be loaded into the initial `GameState.scheduledOrders`.
  predeterminedScheduledOrders?: ScheduledOrder[];
}

export interface ScheduledOrder {
  order: Order;
  releaseTime: number; // Time in milliseconds from game start when order should appear
}

export interface GameState {
  session: GameSession;
  departments: Department[];
  pendingOrders: Order[];
  scheduledOrders: ScheduledOrder[]; // Orders waiting to be released at specific times
  completedOrders: Order[];
  rejectedOrders: Order[];
  totalOrdersGenerated: number;
  totalScore: number;
  gameEvents: GameEvent[];
  performance: GamePerformance;
  sessionLog: SessionLog; // Complete session logging
  decisions: Decision[]; // Decision history for undo/redo
  forecastData: ForecastData; // Delivery forecast based on WIP capacity
  customers: Customer[]; // Customer data management
}

// Forecast for delivery dates based on current WIP capacity
export interface ForecastData {
  averageLeadTime: number;
  capacityUtilization: number;
  expectedDeliveryDates: { [orderId: string]: Date };
  bottleneckDepartment: number | null;
  wipCapacity: { [deptId: number]: number };
}

export interface GameEvent {
  id: string;
  type:
    | "order-generated"
    | "order-completed"
    | "order-late"
    | "equipment-failure"
    | "rush-order"
    | "delivery-delay"
    | "efficiency-boost"
    | "order-released"
    | "game-started"
    | "game-paused"
    | "decision-made"
    | "processing-ready"; // Manual mode: indicates processing is complete and ready for student action
  timestamp: Date;
  message: string;
  severity: "info" | "warning" | "error" | "success";
  departmentId?: number;
  orderId?: string;
  decisionId?: string; // decision tracking
  kpiSnapshot?: GamePerformance; // KPI snapshot at event time
}

// Session logging for CSV/JSON export
export interface SessionLog {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  settings: GameSettings;
  events: GameEvent[];
  finalPerformance: GamePerformance;
  decisions: Decision[];
}

// Decision tracking for undo/redo functionality
export interface Decision {
  id: string;
  timestamp: Date;
  type:
    | "order-release"
    | "game-pause"
    | "game-resume"
    | "settings-change"
    | "order-hold"
    | "order-resume";
  description: string;
  previousState?: Partial<GameState>;
  newState?: Partial<GameState>;
  orderId?: string;
  canUndo: boolean;
}

export interface GamePerformance {
  onTimeDeliveryRate: number;
  averageLeadTime: number;
  totalThroughput: number;
  utilizationRates: { [deptId: number]: number };
  bottleneckDepartment?: number;
}

export interface SLAStatus {
  status: "overdue" | "at-risk" | "on-track";
  color: string;
  text: string;
}

export interface DepartmentStatus {
  color: string;
  text: string;
}

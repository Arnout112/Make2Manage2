// Data Models for Make-to-Order Learning Game

export interface Order {
  id: string;
  customerId: string; // R01: Customer identification
  customerName: string; // R01: Customer name for display
  priority: "low" | "normal" | "high" | "urgent"; // R02: Priority levels
  orderValue: number; // R02: Order value in currency
  dueDate: Date;
  route: number[];
  currentStepIndex: number;
  status:
    | "queued"
    | "processing"
    | "done"
    | "error"
    | "completed-on-time"
    | "completed-late";
  timestamps: { deptId: number; start: Date; end?: Date }[];
  reworkCount: number;
  createdAt: Date;
  processingTime?: number; // Total time needed for current step
  processingTimeRemaining?: number; // Time remaining for current step
  actualLeadTime?: number; // Actual completion time
  slaStatus?: "on-track" | "at-risk" | "overdue";
  completedAt?: Date;
  currentDepartment?: number;
  currentOperationIndex?: number; // For tracking multi-step department operations
  operationProgress?: OperationProgress[]; // Track progress through department operations
  specialInstructions?: string; // R03: Special handling requirements
  rushOrder?: boolean; // R03: Rush order flag
  scheduledStartTime?: Date; // R04-R05: Scheduled start time for capacity planning
}

export interface OperationProgress {
  operationId: string;
  operationName: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  completed: boolean;
}

export interface Department {
  id: number;
  name: string;
  queue: Order[];
  inProcess?: Order;
  utilization: number;
  avgCycleTime: number;
  totalProcessed: number;
  capacity: number; // Max orders that can be processed simultaneously
  efficiency: number; // Worker efficiency multiplier (0.8 - 1.2)
  equipmentCondition: number; // Equipment reliability (0.95 - 1.0)
  status: "available" | "busy" | "overloaded" | "maintenance";
  operations: DepartmentOperation[]; // List of operations this department performs
  standardProcessingTime: number; // Standard time for all operations in minutes
  currentOperationIndex?: number; // For multi-step departments
}

export interface DepartmentOperation {
  id: string;
  name: string;
  duration: number; // Duration in minutes
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
export type ScreenType = "landing" | "game" | "analytics" | "manual-game";
export type NavigationScreen = "game" | "analytics" | "manual-game";

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
  sessionDuration: 15 | 30 | 60; // minutes - R05: 15min, 30min, 1hr options
  orderGenerationRate: "low" | "medium" | "high";
  complexityLevel: "beginner" | "intermediate" | "advanced";
  randomSeed?: string; // for reproducible scenarios
  gameSpeed: 1 | 2 | 4 | 8; // Speed multiplier - R05: speed control
  enableEvents: boolean; // R07: equipment failure, delivery delays
  enableAdvancedRouting: boolean; // R06: advanced routing logic
}

export interface GameState {
  session: GameSession;
  departments: Department[];
  pendingOrders: Order[];
  completedOrders: Order[];
  rejectedOrders: Order[];
  totalOrdersGenerated: number;
  gameEvents: GameEvent[];
  performance: GamePerformance;
  sessionLog: SessionLog; // R12: Complete session logging
  decisions: Decision[]; // R13: Decision history for undo/redo
  forecastData: ForecastData; // R04: Delivery forecast based on WIP capacity
  customers: Customer[]; // R01: Customer data management
}

// R04: Forecast for delivery dates based on current WIP capacity
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
    | "decision-made";
  timestamp: Date;
  message: string;
  severity: "info" | "warning" | "error" | "success";
  departmentId?: number;
  orderId?: string;
  decisionId?: string; // R12: decision tracking
  kpiSnapshot?: GamePerformance; // R12: KPI snapshot at event time
}

// R12: Session logging for CSV/JSON export
export interface SessionLog {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  settings: GameSettings;
  events: GameEvent[];
  finalPerformance: GamePerformance;
  decisions: Decision[];
}

// R13: Decision tracking for undo/redo functionality
export interface Decision {
  id: string;
  timestamp: Date;
  type: "order-release" | "game-pause" | "game-resume" | "settings-change";
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

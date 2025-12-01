/**
 * Order Types for Make2Manage Educational Game
 * Teaching: Order Management in Make-to-Order Manufacturing
 */

export type OrderStatus =
  | "draft" // Order being created/modified
  | "submitted" // Order submitted by customer
  | "under-review" // Sales reviewing order
  | "quoted" // Price quote provided
  | "approved" // Order approved and confirmed
  | "planning" // Production planning phase
  | "scheduled" // Scheduled for production
  | "in-production" // Currently being manufactured
  | "quality-check" // Under quality inspection
  | "ready-to-ship" // Completed and ready for shipment
  | "shipped" // Shipped to customer
  | "delivered" // Delivered to customer
  | "completed-on-time" // Successfully completed on time
  | "completed-late" // Completed but delivered late
  | "on-hold" // Temporarily suspended
  | "cancelled" // Order cancelled
  | "error"; // Error in processing

export type OrderPriority = "low" | "normal" | "high" | "urgent";

export type ProductionRoute = "R01" | "R02" | "R03" | "R04" | "R05";

export type OrderType = "standard" | "custom" | "prototype" | "rush" | "rework";

export interface Order {
  // Basic Order Information
  id: string;
  orderNumber: string; // Human-readable order number
  customerId: string;
  customerName: string;
  customerPO?: string; // Customer's purchase order number

  // Financial Information
  orderValue: number;
  quotedPrice: number;
  actualCost?: number;
  profitMargin: number;
  currency: string;
  paymentTerms: number; // days

  // Priority and Scheduling
  priority: OrderPriority;
  orderType: OrderType;
  rushOrder: boolean;
  // Absolute due date (legacy) - prefer using `dueGameMinutes` for in-game deadlines
  dueDate?: string;
  // New: due time in minutes measured from the start of the game session
  dueGameMinutes?: number;
  requestedDeliveryDate: string;
  promisedDeliveryDate?: string;

  // Production Information
  route: ProductionRoute[];
  estimatedDuration: number; // in hours
  actualDuration?: number;
  setupTime: number; // hours needed for setup
  processingTime: number; // processing time (milliseconds)

  // Product Details
  productId: string;
  productName: string;
  productDescription?: string;
  quantity: number;
  unitOfMeasure: string;
  specifications: ProductSpecification[];

  // Quality Requirements
  qualityLevel: "standard" | "premium" | "critical";
  qualityScore?: number;
  inspectionRequired: boolean;
  certificationRequired: boolean;

  // Status and Tracking
  status: OrderStatus;
  statusHistory: OrderStatusChange[];

  // Dates
  createdAt: string;
  lastModified: string;
  startedAt?: string;
  completedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;

  // Communication
  specialInstructions?: string;
  internalNotes?: string;
  customerFeedback?: string;

  // Performance Metrics
  customerSatisfaction?: number;
  onTimeDelivery: boolean;
  deliveryPerformance?: number; // percentage of on-time delivery

  // Educational Tracking
  decisionPoints: OrderDecisionPoint[];
  learningFlags: string[]; // Educational markers for analysis
}

export interface ProductSpecification {
  attribute: string;
  value: string;
  unit?: string;
  tolerance?: string;
  critical: boolean;
}

export interface OrderStatusChange {
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  timestamp: string;
  changedBy: string;
  reason?: string;
  notes?: string;
}

export interface OrderDecisionPoint {
  timestamp: string;
  phase: string;
  decision: string;
  alternatives: string[];
  reasoning?: string;
  impact: {
    cost?: number;
    time?: number;
    quality?: number;
    satisfaction?: number;
  };
}

// Filtering and Searching
export interface OrderFilter {
  status?: OrderStatus[];
  priority?: OrderPriority[];
  orderType?: OrderType[];
  customer?: string;
  dateRange?: {
    start: string;
    end: string;
    field: "createdAt" | "dueDate" | "completedAt";
  };
  rushOnly?: boolean;
  route?: ProductionRoute[];
  valueRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}

export interface OrderSortOptions {
  field: "dueDate" | "priority" | "orderValue" | "createdAt" | "customerName";
  direction: "asc" | "desc";
  secondary?: {
    field: "dueDate" | "priority" | "orderValue" | "createdAt" | "customerName";
    direction: "asc" | "desc";
  };
}

// Analytics and Metrics
export interface OrderMetrics {
  // Volume Metrics
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;

  // Performance Metrics
  onTimeDeliveryRate: number;
  averageLeadTime: number;
  averageProcessingTime: number;
  averageSetupTime: number;

  // Financial Metrics
  totalRevenue: number;
  averageOrderValue: number;
  totalProfitMargin: number;
  averageProfitMargin: number;

  // Quality Metrics
  averageQualityScore: number;
  defectRate: number;
  reworkRate: number;

  // Customer Metrics
  customerSatisfactionAvg: number;
  repeatOrderRate: number;

  // Operational Metrics
  resourceUtilization: number;
  bottleneckRoutes: ProductionRoute[];
  rushOrderPercentage: number;
}

export interface OrderTrend {
  period: string;
  orderCount: number;
  revenue: number;
  onTimeRate: number;
  satisfaction: number;
  avgLeadTime: number;
}

// Educational Analysis
export interface OrderAnalysis {
  orderId: string;
  decisions: OrderDecisionPoint[];
  educationalInsights: {
    concept: string;
    demonstration: string;
    learningOutcome: string;
  }[];
  performanceImpact: {
    financial: number;
    operational: number;
    customer: number;
  };
  recommendations: string[];
}

// Batch Operations
export interface OrderBatch {
  id: string;
  name: string;
  orderIds: string[];
  operation:
    | "bulk-approve"
    | "bulk-schedule"
    | "bulk-priority-change"
    | "bulk-route-change";
  parameters: Record<string, any>;
  createdBy: string;
  createdAt: string;
  processedAt?: string;
  results?: OrderBatchResult[];
}

export interface OrderBatchResult {
  orderId: string;
  success: boolean;
  message: string;
  changes?: Record<string, any>;
}

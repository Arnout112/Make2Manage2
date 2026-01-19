/**
 * Customer Types for Make2Manage Educational Game
 * Teaching: Customer Relationship Management in Manufacturing
 */

export type CustomerTier = "standard" | "premium" | "vip";
export type CustomerStatus =
  | "active"
  | "inactive"
  | "prospect"
  | "on-hold"
  | "blacklisted";
export type CustomerType =
  | "individual"
  | "small-business"
  | "enterprise"
  | "government";

export interface Customer {
  // Basic Information
  id: string;
  customerNumber: string; // Human-readable customer number
  name: string;
  displayName?: string;
  type: CustomerType;
  tier: CustomerTier;
  status: CustomerStatus;

  // Contact Information
  primaryContact: ContactPerson;
  additionalContacts: ContactPerson[];
  addresses: CustomerAddress[];

  // Business Information
  industry: string;
  companySize: "micro" | "small" | "medium" | "large" | "enterprise";
  yearEstablished?: number;
  website?: string;
  taxId?: string;

  // Financial Information
  creditLimit: number;
  currentCredit: number;
  availableCredit: number;
  paymentTerms: number; // days
  defaultCurrency: string;
  creditRating: "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "C";

  // Relationship Metrics
  relationshipStart: string;
  lastOrderDate?: string;
  totalLifetimeValue: number;
  averageOrderValue: number;
  totalOrderCount: number;
  satisfactionScore: number;
  loyaltyScore: number;

  // Operational Preferences
  preferredRoutes: string[]; // Production routes they typically use
  preferredDeliveryMethods: string[];
  specialRequirements?: string[];
  communicationPreferences: {
    email: boolean;
    phone: boolean;
    portal: boolean;
    preferredLanguage: string;
    timezone: string;
  };

  // Contract Information
  contractType?: "framework" | "annual" | "project-based" | "spot";
  contractStartDate?: string;
  contractEndDate?: string;
  discountLevel: number; // percentage
  volumeCommitments?: VolumeCommitment[];

  // Quality and Compliance
  qualityRequirements: QualityStandard[];
  certificationRequirements: string[];
  auditSchedule?: string;
  complianceStatus: "compliant" | "non-compliant" | "under-review";

  // Risk Assessment
  riskLevel: "low" | "medium" | "high" | "critical";
  riskFactors: string[];
  paymentHistory: PaymentRecord[];

  // Timestamps
  createdAt: string;
  lastModified: string;
  lastContactDate?: string;

  // Educational Tracking
  learningProfile?: CustomerLearningProfile;
  simulationNotes?: string[];
}

export interface ContactPerson {
  id: string;
  name: string;
  title: string;
  department?: string;
  email: string;
  phone: string;
  mobile?: string;
  isPrimary: boolean;
  roles: ("orders" | "technical" | "financial" | "management")[];
  preferredContactMethod: "email" | "phone" | "mobile";
  notes?: string;
}

export interface CustomerAddress {
  id: string;
  type: "billing" | "shipping" | "headquarters" | "facility";
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  specialInstructions?: string;
}

export interface VolumeCommitment {
  productCategory: string;
  minimumQuantity: number;
  period: "monthly" | "quarterly" | "annually";
  discountRate: number;
  penaltyRate?: number;
}

export interface QualityStandard {
  standard: string;
  version: string;
  required: boolean;
  certificationBody?: string;
  validUntil?: string;
}

export interface PaymentRecord {
  invoiceId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  daysPastDue?: number;
  status: "paid" | "overdue" | "disputed" | "written-off";
}

export interface CustomerLearningProfile {
  complexity: "simple" | "moderate" | "complex";
  behaviralTraits: string[];
  decisionPattern: "quick" | "deliberate" | "collaborative";
  priorities: ("cost" | "quality" | "speed" | "reliability")[];
  communicationStyle:
    | "formal"
    | "casual"
    | "technical"
    | "relationship-focused";
}

// Filtering and Analysis
export interface CustomerFilter {
  tier?: CustomerTier[];
  status?: CustomerStatus[];
  type?: CustomerType[];
  industry?: string[];
  creditRating?: string[];
  riskLevel?: string[];
  orderValueRange?: {
    min: number;
    max: number;
  };
  lastOrderDays?: number; // Orders within last X days
  satisfactionRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}

export interface CustomerMetrics {
  // Count Metrics
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  lostCustomersThisMonth: number;

  // Tier Distribution
  vipCustomers: number;
  premiumCustomers: number;
  standardCustomers: number;

  // Financial Metrics
  totalCreditExposure: number;
  averageCreditLimit: number;
  totalOutstanding: number;
  badDebtRate: number;

  // Relationship Metrics
  averageSatisfactionScore: number;
  averageLoyaltyScore: number;
  customerRetentionRate: number;
  repeatOrderRate: number;

  // Operational Metrics
  averageResponseTime: number;
  complaintResolutionTime: number;
  orderFulfillmentAccuracy: number;

  // Business Metrics
  customerLifetimeValue: number;
  acquisitionCost: number;
  churnRate: number;
  upsellSuccess: number;
}

export interface CustomerAnalysis {
  customerId: string;
  segment:
    | "champion"
    | "loyal"
    | "potential-loyal"
    | "new"
    | "at-risk"
    | "cannot-lose"
    | "hibernating";
  valueScore: number;
  riskScore: number;
  growthPotential: "high" | "medium" | "low";
  recommendedActions: string[];
  keyInsights: string[];
  nextContactSuggestion: string;
}

// Relationship Management
export interface CustomerInteraction {
  id: string;
  customerId: string;
  contactPersonId?: string;
  type:
    | "meeting"
    | "call"
    | "email"
    | "order"
    | "complaint"
    | "feedback"
    | "visit";
  subject: string;
  description: string;
  outcome?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  createdBy: string;
  createdAt: string;
  attachments?: string[];
}

export interface CustomerContract {
  id: string;
  customerId: string;
  contractNumber: string;
  type: "master" | "framework" | "spot" | "service";
  status: "draft" | "active" | "expired" | "terminated" | "suspended";
  startDate: string;
  endDate: string;
  renewalDate?: string;
  autoRenewal: boolean;
  terms: ContractTerm[];
  value: number;
  currency: string;
  signedBy: string;
  signedDate?: string;
}

export interface ContractTerm {
  category:
    | "pricing"
    | "delivery"
    | "quality"
    | "payment"
    | "liability"
    | "other";
  description: string;
  value?: string;
  required: boolean;
  negotiable: boolean;
}

// Customer Segmentation for Educational Purposes
export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: CustomerFilter;
  characteristics: string[];
  strategy: string;
  expectedBehavior: string[];
  educationalValue: string;
}

export interface CustomerScenario {
  id: string;
  name: string;
  description: string;
  customer: Partial<Customer>;
  expectedInteractions: CustomerInteraction[];
  learningObjectives: string[];
  decisionPoints: string[];
  successCriteria: string[];
}

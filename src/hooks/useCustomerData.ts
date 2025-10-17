/**
 * Custom Hook for Customer Data Management
 * Educational Focus: Teaching customer relationship management and analysis
 */

import { useState, useMemo, useCallback } from "react";
import { CustomerService } from "../services/customerService";
import type {
  Customer,
  CustomerFilter,
  CustomerAnalysis,
  CustomerInteraction,
} from "../types/customers";

export interface UseCustomerDataProps {
  customers: Customer[];
  onCustomerUpdate?: (customerId: string, updates: Partial<Customer>) => void;
  onInteractionAdded?: (interaction: CustomerInteraction) => void;
}

export function useCustomerData({
  customers,
  onCustomerUpdate,
  onInteractionAdded,
}: UseCustomerDataProps) {
  // Filter and search state
  const [filters, setFilters] = useState<CustomerFilter>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "tier" | "value" | "satisfaction" | "lastOrder"
  >("value");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // UI state
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid" | "analysis">(
    "list"
  );
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Combine filters including search
  const combinedFilters = useMemo(
    () => ({
      ...filters,
      searchTerm: searchTerm || undefined,
    }),
    [filters, searchTerm]
  );

  // Apply filtering and sorting
  const processedCustomers = useMemo(() => {
    // Filter customers
    let filtered = CustomerService.filterCustomers(customers, combinedFilters);

    // Sort by business value first (educational default)
    if (sortBy === "value") {
      filtered = CustomerService.sortCustomersByValue(filtered);
    } else {
      // Apply custom sorting
      filtered = [...filtered].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
          case "name":
            aValue = a.name;
            bValue = b.name;
            break;
          case "tier":
            const tierOrder = { vip: 3, premium: 2, standard: 1 };
            aValue = tierOrder[a.tier];
            bValue = tierOrder[b.tier];
            break;
          case "satisfaction":
            aValue = a.satisfactionScore;
            bValue = b.satisfactionScore;
            break;
          case "lastOrder":
            aValue = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
            bValue = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
            break;
          default:
            aValue = a.totalLifetimeValue;
            bValue = b.totalLifetimeValue;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === "desc" ? -comparison : comparison;
        } else {
          const comparison = (aValue as number) - (bValue as number);
          return sortDirection === "desc" ? -comparison : comparison;
        }
      });
    }

    return filtered;
  }, [customers, combinedFilters, sortBy, sortDirection]);

  // Calculate customer metrics
  const metrics = useMemo(
    () => CustomerService.calculateCustomerMetrics(processedCustomers),
    [processedCustomers]
  );

  // Analyze all customers for educational insights
  const customerAnalyses = useMemo(
    () =>
      processedCustomers.map((customer) =>
        CustomerService.analyzeCustomer(customer)
      ),
    [processedCustomers]
  );

  // Group customers by segments for educational purposes
  const customerSegments = useMemo(() => {
    const segments: Record<string, CustomerAnalysis[]> = {};

    customerAnalyses.forEach((analysis) => {
      if (!segments[analysis.segment]) {
        segments[analysis.segment] = [];
      }
      segments[analysis.segment].push(analysis);
    });

    return segments;
  }, [customerAnalyses]);

  // Educational insights about customer portfolio
  const educationalInsights = useMemo(() => {
    const insights: string[] = [];

    const atRiskCustomers = customerAnalyses.filter(
      (a) => a.segment === "at-risk"
    );
    const cannotLoseCustomers = customerAnalyses.filter(
      (a) => a.segment === "cannot-lose"
    );
    const highValueCustomers = customerAnalyses.filter(
      (a) => a.valueScore >= 80
    );

    if (atRiskCustomers.length > 0) {
      insights.push(
        `${atRiskCustomers.length} customers are at risk of churning - immediate attention needed`
      );
    }

    if (cannotLoseCustomers.length > 0) {
      insights.push(
        `${cannotLoseCustomers.length} high-value customers need urgent intervention`
      );
    }

    if (metrics.averageSatisfactionScore < 70) {
      insights.push(
        "Customer satisfaction is below target - review service quality"
      );
    }

    if (metrics.badDebtRate > 5) {
      insights.push("Bad debt rate is high - review credit policies");
    }

    const vipPercentage = (metrics.vipCustomers / metrics.totalCustomers) * 100;
    if (vipPercentage < 10) {
      insights.push(
        "Low percentage of VIP customers - consider loyalty programs"
      );
    }

    if (highValueCustomers.length > 0) {
      insights.push(
        `${highValueCustomers.length} customers have high growth potential`
      );
    }

    return insights;
  }, [customerAnalyses, metrics]);

  // Filter management functions
  const updateFilters = useCallback((newFilters: Partial<CustomerFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
  }, []);

  const clearFilter = useCallback((filterKey: keyof CustomerFilter) => {
    setFilters((prev) => {
      const updated = { ...prev };
      delete updated[filterKey];
      return updated;
    });
  }, []);

  // Customer action functions
  const updateCustomerTier = useCallback(
    (customerId: string, newTier: Customer["tier"]) => {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) return;

      onCustomerUpdate?.(customerId, {
        tier: newTier,
        lastModified: new Date().toISOString(),
      });
    },
    [customers, onCustomerUpdate]
  );

  const updateSatisfactionScore = useCallback(
    (customerId: string, score: number) => {
      onCustomerUpdate?.(customerId, {
        satisfactionScore: Math.max(0, Math.min(100, score)),
        lastModified: new Date().toISOString(),
      });
    },
    [onCustomerUpdate]
  );

  const recordInteraction = useCallback(
    (
      customerId: string,
      interaction: Omit<CustomerInteraction, "id" | "customerId" | "createdAt">
    ) => {
      const newInteraction = CustomerService.recordCustomerInteraction(
        customerId,
        interaction
      );
      onInteractionAdded?.(newInteraction);

      // Update last contact date
      onCustomerUpdate?.(customerId, {
        lastContactDate: new Date().toISOString(),
      });
    },
    [onInteractionAdded, onCustomerUpdate]
  );

  const adjustCreditLimit = useCallback(
    (customerId: string, newLimit: number) => {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) return;

      const currentUsed = customer.creditLimit - customer.availableCredit;
      const newAvailable = Math.max(0, newLimit - currentUsed);

      onCustomerUpdate?.(customerId, {
        creditLimit: newLimit,
        availableCredit: newAvailable,
        lastModified: new Date().toISOString(),
      });
    },
    [customers, onCustomerUpdate]
  );

  // Get specific customer analysis
  const getCustomerAnalysis = useCallback(
    (customerId: string): CustomerAnalysis | undefined => {
      return customerAnalyses.find(
        (analysis) => analysis.customerId === customerId
      );
    },
    [customerAnalyses]
  );

  // Get customer details with analysis
  const getCustomerDetails = useCallback(
    (customerId: string) => {
      const customer = customers.find((c) => c.id === customerId);
      const analysis = getCustomerAnalysis(customerId);
      return customer ? { customer, analysis } : undefined;
    },
    [customers, getCustomerAnalysis]
  );

  // Educational functions for scenario-based learning
  const getCustomersNeedingAttention = useCallback(() => {
    return customerAnalyses
      .filter((analysis) =>
        ["at-risk", "cannot-lose", "hibernating"].includes(analysis.segment)
      )
      .map((analysis) => ({
        customer: customers.find((c) => c.id === analysis.customerId)!,
        analysis,
        urgency:
          analysis.segment === "cannot-lose"
            ? "critical"
            : analysis.segment === "at-risk"
            ? "high"
            : "medium",
      }));
  }, [customerAnalyses, customers]);

  const getHighValueCustomers = useCallback(() => {
    return customerAnalyses
      .filter((analysis) => analysis.valueScore >= 70)
      .sort((a, b) => b.valueScore - a.valueScore)
      .map((analysis) => ({
        customer: customers.find((c) => c.id === analysis.customerId)!,
        analysis,
      }));
  }, [customerAnalyses, customers]);

  // Count active filters for UI feedback
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.tier?.length) count++;
    if (filters.status?.length) count++;
    if (filters.type?.length) count++;
    if (filters.industry?.length) count++;
    if (filters.creditRating?.length) count++;
    if (filters.riskLevel?.length) count++;
    if (filters.orderValueRange) count++;
    if (filters.lastOrderDays) count++;
    if (filters.satisfactionRange) count++;
    if (searchTerm) count++;
    return count;
  }, [filters, searchTerm]);

  return {
    // Data
    customers: processedCustomers,
    allCustomers: customers,
    metrics,
    customerAnalyses,
    customerSegments,
    educationalInsights,

    // Filter state
    filters,
    searchTerm,
    sortBy,
    sortDirection,
    activeFilterCount,

    // UI state
    selectedCustomer,
    viewMode,
    isFilterPanelOpen,

    // Filter actions
    updateFilters,
    clearFilters,
    clearFilter,
    setSearchTerm,
    setSortBy,
    setSortDirection,
    setIsFilterPanelOpen,

    // Customer actions
    updateCustomerTier,
    updateSatisfactionScore,
    recordInteraction,
    adjustCreditLimit,

    // Analysis functions
    getCustomerAnalysis,
    getCustomerDetails,
    getCustomersNeedingAttention,
    getHighValueCustomers,

    // UI actions
    setSelectedCustomer,
    setViewMode,
  };
}

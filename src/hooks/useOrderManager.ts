/**
 * Custom Hook for Order Management
 * Educational Focus: Teaching order workflow and business logic separation
 */

import { useState, useMemo, useCallback } from "react";
import { OrderService } from "../services/orderService";
import type { Order, OrderFilter, OrderSortOptions } from "../types/orders";
import type { Customer } from "../types/customers";

export interface UseOrderManagerProps {
  orders: Order[];
  customers: Customer[];
  onOrderUpdate?: (orderId: string, updates: Partial<Order>) => void;
  onDecisionMade?: (decision: string, context: any) => void;
}

export function useOrderManager({
  orders,
  customers,
  onOrderUpdate,
  onDecisionMade,
}: UseOrderManagerProps) {
  // Filter and sorting state
  const [filters, setFilters] = useState<OrderFilter>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [sortOptions, setSortOptions] = useState<OrderSortOptions>({
    field: "dueDate",
    direction: "asc",
  });

  // UI state
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid" | "kanban">("list");

  // Combine all filters including search and customer selection
  const combinedFilters = useMemo(
    () => ({
      ...filters,
      searchTerm: searchTerm || undefined,
      customer: selectedCustomer || undefined,
    }),
    [filters, searchTerm, selectedCustomer]
  );

  // Apply filtering, sorting, and processing
  const processedOrders = useMemo(() => {
    // First, filter the orders
    let filtered = OrderService.filterOrders(orders, combinedFilters);

    // Then sort by priority (educational sorting algorithm)
    filtered = OrderService.sortOrdersByPriority(filtered);

    // Finally, apply custom sorting if specified
    if (sortOptions.field !== "dueDate" || sortOptions.direction !== "asc") {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortOptions.field];
        const bValue = b[sortOptions.field];

        let comparison = 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else {
          // Handle date strings
          const aDate = new Date(aValue as string).getTime();
          const bDate = new Date(bValue as string).getTime();
          comparison = aDate - bDate;
        }

        return sortOptions.direction === "desc" ? -comparison : comparison;
      });
    }

    return filtered;
  }, [orders, combinedFilters, sortOptions]);

  // Calculate metrics for educational feedback
  const metrics = useMemo(
    () => OrderService.calculateOrderMetrics(processedOrders),
    [processedOrders]
  );

  // Get customer map for quick lookups
  const customerMap = useMemo(
    () =>
      customers.reduce((map, customer) => {
        map[customer.id] = customer;
        return map;
      }, {} as Record<string, Customer>),
    [customers]
  );

  // Educational insights about current order state
  const educationalInsights = useMemo(() => {
    const insights: string[] = [];

    if (metrics.onTimeDeliveryRate < 80) {
      insights.push(
        "On-time delivery rate is below 80% - consider production planning improvements"
      );
    }

    if (metrics.rushOrderPercentage > 30) {
      insights.push(
        "High percentage of rush orders may indicate planning issues"
      );
    }

    if (metrics.averageProfitMargin < 15) {
      insights.push(
        "Low profit margins - review pricing strategy or cost optimization"
      );
    }

    const urgentOrders = processedOrders.filter((o) => o.priority === "urgent");
    if (urgentOrders.length > 5) {
      insights.push(
        `${urgentOrders.length} urgent orders require immediate attention`
      );
    }

    return insights;
  }, [metrics, processedOrders]);

  // Filter management functions
  const updateFilters = useCallback((newFilters: Partial<OrderFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
    setSelectedCustomer("");
  }, []);

  const clearFilter = useCallback((filterKey: keyof OrderFilter) => {
    setFilters((prev) => {
      const updated = { ...prev };
      delete updated[filterKey];
      return updated;
    });
  }, []);

  // Order action functions
  const approveOrder = useCallback(
    (orderId: string, context?: any) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      // Educational decision tracking
      onDecisionMade?.("order_approved", { orderId, ...context });

      // Update order status
      onOrderUpdate?.(orderId, {
        status: "approved",
        statusHistory: [
          ...order.statusHistory,
          {
            fromStatus: order.status,
            toStatus: "approved",
            timestamp: new Date().toISOString(),
            changedBy: "player",
            reason: "Order approved for production",
          },
        ],
      });
    },
    [orders, onDecisionMade, onOrderUpdate]
  );

  const rejectOrder = useCallback(
    (orderId: string, reason: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      onDecisionMade?.("order_rejected", { orderId, reason });

      onOrderUpdate?.(orderId, {
        status: "cancelled",
        statusHistory: [
          ...order.statusHistory,
          {
            fromStatus: order.status,
            toStatus: "cancelled",
            timestamp: new Date().toISOString(),
            changedBy: "player",
            reason,
          },
        ],
      });
    },
    [orders, onDecisionMade, onOrderUpdate]
  );

  const changePriority = useCallback(
    (orderId: string, newPriority: Order["priority"]) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      onDecisionMade?.("priority_changed", {
        orderId,
        oldPriority: order.priority,
        newPriority,
      });

      onOrderUpdate?.(orderId, { priority: newPriority });
    },
    [orders, onDecisionMade, onOrderUpdate]
  );

  const toggleRushOrder = useCallback(
    (orderId: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      const newRushStatus = !order.rushOrder;
      onDecisionMade?.("rush_order_toggle", {
        orderId,
        rushOrder: newRushStatus,
      });

      onOrderUpdate?.(orderId, { rushOrder: newRushStatus });
    },
    [orders, onDecisionMade, onOrderUpdate]
  );

  const releaseOrder = useCallback(
    (orderId: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      // Educational validation
      if (!order.route || order.route.length === 0) {
        onDecisionMade?.("order_release_failed", {
          orderId,
          reason: "No production route defined",
        });
        return false;
      }

      onDecisionMade?.("order_released", { orderId });

      onOrderUpdate?.(orderId, {
        status: "in-production",
        startedAt: new Date().toISOString(),
      });

      return true;
    },
    [orders, onDecisionMade, onOrderUpdate]
  );

  // Selection management
  const toggleOrderSelection = useCallback((orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  }, []);

  const selectAllOrders = useCallback(() => {
    setSelectedOrders(processedOrders.map((order) => order.id));
  }, [processedOrders]);

  const clearSelection = useCallback(() => {
    setSelectedOrders([]);
  }, []);

  // Bulk operations
  const bulkApprove = useCallback(() => {
    selectedOrders.forEach((orderId) => approveOrder(orderId));
    clearSelection();
  }, [selectedOrders, approveOrder, clearSelection]);

  const bulkChangePriority = useCallback(
    (priority: Order["priority"]) => {
      selectedOrders.forEach((orderId) => changePriority(orderId, priority));
      clearSelection();
    },
    [selectedOrders, changePriority, clearSelection]
  );

  // Get orders by status for kanban view
  const ordersByStatus = useMemo(() => {
    const grouped: Record<Order["status"], Order[]> = {} as any;

    processedOrders.forEach((order) => {
      if (!grouped[order.status]) {
        grouped[order.status] = [];
      }
      grouped[order.status].push(order);
    });

    return grouped;
  }, [processedOrders]);

  // Active filter count for UI feedback
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status?.length) count++;
    if (filters.priority?.length) count++;
    if (filters.orderType?.length) count++;
    if (filters.customer) count++;
    if (filters.rushOnly) count++;
    if (filters.dateRange) count++;
    if (filters.valueRange) count++;
    if (searchTerm) count++;
    return count;
  }, [filters, searchTerm]);

  return {
    // Data
    orders: processedOrders,
    allOrders: orders,
    metrics,
    customerMap,
    educationalInsights,
    ordersByStatus,

    // Filter state
    filters,
    searchTerm,
    selectedCustomer,
    sortOptions,
    activeFilterCount,
    isFilterPanelOpen,

    // UI state
    selectedOrders,
    viewMode,

    // Filter actions
    updateFilters,
    clearFilters,
    clearFilter,
    setSearchTerm,
    setSelectedCustomer,
    setSortOptions,
    setIsFilterPanelOpen,

    // Order actions
    approveOrder,
    rejectOrder,
    changePriority,
    toggleRushOrder,
    releaseOrder,

    // Selection actions
    toggleOrderSelection,
    selectAllOrders,
    clearSelection,

    // Bulk actions
    bulkApprove,
    bulkChangePriority,

    // View actions
    setViewMode,
  };
}

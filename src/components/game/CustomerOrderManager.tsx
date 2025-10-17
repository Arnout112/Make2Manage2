/**
 * CustomerOrderManager - Educational Order Management Component
 * Educational Focus: Teaching order lifecycle, customer management, and decision-making
 */

import { useState, useMemo } from "react";
import { formatCurrency } from "../../utils/formatters";
import { EDUCATIONAL_TIPS } from "../../constants";
import type { Order, OrderStatus, OrderPriority } from "../../types/orders";

interface CustomerOrderManagerProps {
  orders: Order[];
  customers: any[];
  onReleaseOrder: (orderId: string) => void;
  onModifyOrder?: (orderId: string, modifications: Partial<Order>) => void;
  className?: string;
  showEducationalFeatures?: boolean;
}

export default function CustomerOrderManager({
  orders = [],
  customers = [],
  onReleaseOrder,
  className = "",
  showEducationalFeatures = true,
}: CustomerOrderManagerProps) {
  // Local UI State
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<OrderPriority | "all">(
    "all"
  );
  const [showEducationalTips, setShowEducationalTips] = useState(
    showEducationalFeatures
  );
  const [highlightDecisionPoints, setHighlightDecisionPoints] = useState(true);

  // Helper function to calculate simple profitability from order data
  const getOrderProfitability = (order: Order): number => {
    // Use the order's built-in profit margin if available
    if (order.profitMargin) {
      return order.profitMargin;
    }

    // Calculate basic profitability using available order data
    const estimatedCost = order.orderValue * 0.7; // Assume 70% cost ratio
    const profit = order.orderValue - estimatedCost;
    return (profit / order.orderValue) * 100;
  };

  // Calculated Values for Educational Display
  const orderStatistics = useMemo(() => {
    const filteredOrders = orders || [];
    return {
      totalOrders: filteredOrders.length,
      pendingOrders: filteredOrders.filter(
        (o) => o.status === "under-review" || o.status === "submitted"
      ).length,
      urgentOrders: filteredOrders.filter((o) => o.priority === "urgent")
        .length,
      averageProfitability:
        filteredOrders.length > 0
          ? filteredOrders.reduce(
              (sum, order) => sum + getOrderProfitability(order),
              0
            ) / filteredOrders.length
          : 0,
      customerSatisfactionImpact: 85.0, // Placeholder value
    };
  }, [orders]);

  // Educational Decision Tracking
  const handleOrderDecision = async (
    order: Order,
    decision: "approve" | "reject" | "modify",
    reasoning?: string
  ) => {
    try {
      console.log(`Educational Decision: ${decision} for order ${order.id}`, {
        profitability: getOrderProfitability(order),
        reasoning,
      });

      // In a real implementation, this would call the appropriate service
      switch (decision) {
        case "approve":
          console.log("Order approved:", order.id);
          break;
        case "reject":
          console.log("Order rejected:", order.id);
          break;
        case "modify":
          console.log("Order modification requested:", order.id);
          break;
      }
    } catch (error) {
      console.error("Error processing order decision:", error);
    }
  };

  // Priority Color Coding for Visual Learning
  const getPriorityColor = (priority: OrderPriority): string => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "normal":
        return "bg-green-100 text-green-800 border-green-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Status Color Coding for Visual Learning
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case "submitted":
        return "bg-orange-100 text-orange-800";
      case "under-review":
        return "bg-orange-100 text-orange-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "in-production":
        return "bg-purple-100 text-purple-800";
      case "quality-check":
        return "bg-indigo-100 text-indigo-800";
      case "ready-to-ship":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get orders to display with filters
  const displayOrders = useMemo(() => {
    let filtered = orders || [];

    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((order) => order.priority === filterPriority);
    }

    return filtered;
  }, [orders, filterStatus, filterPriority]);

  return (
    <div className={`customer-order-manager ${className}`}>
      {/* Educational Header with KPIs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Order Management Center
            </h2>
            {showEducationalFeatures && (
              <button
                onClick={() => console.log("Learning guide clicked")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                📚 Learning Guide
              </button>
            )}
          </div>

          {/* Educational KPI Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-900">
                {orderStatistics.totalOrders}
              </div>
              <div className="text-sm text-blue-700">Total Orders</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-900">
                {orderStatistics.pendingOrders}
              </div>
              <div className="text-sm text-orange-700">Pending Review</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-900">
                {orderStatistics.urgentOrders}
              </div>
              <div className="text-sm text-red-700">Urgent Orders</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-900">
                {orderStatistics.averageProfitability.toFixed(1)}%
              </div>
              <div className="text-sm text-green-700">Avg Profitability</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-900">
                {orderStatistics.customerSatisfactionImpact.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-700">On-Time Delivery</div>
            </div>
          </div>
        </div>

        {/* Educational Tips Bar */}
        {showEducationalTips && EDUCATIONAL_TIPS.orderManagement && (
          <div className="bg-blue-50 px-6 py-3 border-b border-blue-200">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600">💡</div>
              <div className="text-blue-800 text-sm">
                <strong>Pro Tip:</strong> {EDUCATIONAL_TIPS.orderManagement[0]}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Status:
              </label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as OrderStatus | "all")
                }
                className="rounded-md border border-gray-300 px-3 py-1 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under-review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="in-production">In Production</option>
                <option value="quality-check">Quality Check</option>
                <option value="ready-to-ship">Ready to Ship</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Priority:
              </label>
              <select
                value={filterPriority}
                onChange={(e) =>
                  setFilterPriority(e.target.value as OrderPriority | "all")
                }
                className="rounded-md border border-gray-300 px-3 py-1 text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>

            {showEducationalFeatures && (
              <div className="flex items-center space-x-4 ml-auto">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showEducationalTips}
                    onChange={(e) => setShowEducationalTips(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>Show Tips</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={highlightDecisionPoints}
                    onChange={(e) =>
                      setHighlightDecisionPoints(e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                  <span>Highlight Decisions</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Financial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayOrders.map((order) => {
                const customer = customers?.find(
                  (c) => c.id === order.customerId
                );
                const profitability = getOrderProfitability(order);
                const isDecisionPoint =
                  (order.status === "submitted" ||
                    order.status === "under-review") &&
                  highlightDecisionPoints;

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 ${
                      isDecisionPoint
                        ? "bg-yellow-50 border-l-4 border-yellow-400"
                        : ""
                    }`}
                  >
                    {/* Order Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          #{order.orderNumber}
                        </div>
                        <div className="text-gray-500">
                          {order.customerPO || "No PO"}
                        </div>
                        <div className="text-gray-500">
                          Type: {order.orderType}
                        </div>
                      </div>
                    </td>

                    {/* Customer Information */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {order.customerName}
                        </div>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {customer?.tier?.toUpperCase() || "STANDARD"}
                        </span>
                      </div>
                    </td>

                    {/* Status & Priority */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.replace("-", " ").toUpperCase()}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                            order.priority
                          )}`}
                        >
                          {order.priority.toUpperCase()}
                        </span>
                        {order.rushOrder && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            RUSH
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Financial Information */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatCurrency(order.orderValue)}
                        </div>
                        <div
                          className={`text-sm ${
                            profitability >= 15
                              ? "text-green-600"
                              : profitability >= 5
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {profitability.toFixed(1)}% margin
                        </div>
                      </div>
                    </td>

                    {/* Timeline */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <div className="text-gray-900">
                          {new Date(order.dueDate).toLocaleDateString()}
                        </div>
                        <div
                          className={`text-sm ${
                            order.priority === "urgent"
                              ? "text-red-600"
                              : order.priority === "high"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {order.priority === "urgent"
                            ? "URGENT"
                            : order.priority === "high"
                            ? "Soon"
                            : "On track"}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {(order.status === "submitted" ||
                          order.status === "under-review") && (
                          <>
                            <button
                              onClick={() =>
                                handleOrderDecision(
                                  order,
                                  "approve",
                                  "Approved based on profitability and capacity"
                                )
                              }
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleOrderDecision(
                                  order,
                                  "reject",
                                  "Rejected due to low profitability"
                                )
                              }
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {order.status === "approved" && onReleaseOrder && (
                          <button
                            onClick={() => onReleaseOrder(order.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                          >
                            Release
                          </button>
                        )}
                        <button
                          onClick={() => console.log("Order details:", order)}
                          className="text-blue-600 hover:text-blue-900 text-xs"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* No orders message */}
        {displayOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders match the current filters
          </div>
        )}
      </div>

      {/* Educational Insights Panel */}
      {showEducationalFeatures && (
        <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📊 Learning Insights
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">
                Decision Analysis
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Orders requiring decision: {orderStatistics.pendingOrders}
                </li>
                <li>• Urgent orders: {orderStatistics.urgentOrders}</li>
                <li>
                  • Average profitability:{" "}
                  {orderStatistics.averageProfitability.toFixed(1)}%
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">
                Performance Trends
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Customer satisfaction:{" "}
                  {orderStatistics.customerSatisfactionImpact.toFixed(1)}%
                </li>
                <li>
                  • Profitability trend:{" "}
                  {orderStatistics.averageProfitability >= 15
                    ? "↗️ Strong"
                    : "↘️ Needs attention"}
                </li>
                <li>• Total active orders: {orderStatistics.totalOrders}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

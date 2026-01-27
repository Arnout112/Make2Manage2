import { useState, useMemo } from "react";
import { Clock, CheckCircle, Factory, AlertTriangle } from "lucide-react";
import { useSharedGameState } from "../contexts/GameStateContext";
import { PerformanceDashboard } from "../components";
import { formatTime } from "../utils/timeFormat";

export default function AnalyticsScreen() {
  // Use shared game state for performance data with error handling
  let gameState;
  try {
    const sharedState = useSharedGameState();
    gameState = sharedState.gameState;
  } catch (error) {
    console.error("AnalyticsScreen: Error accessing shared game state:", error);
    gameState = null;
  }

  // Filter options removed (non-functional)

  // Re-implemented analysis filters (functional)
  const [timeWindow, setTimeWindow] = useState<
    "5min" | "15min" | "30min" | "1hour" | "full"
  >("1hour");
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "all" | "completed" | "active" | "error"
  >("all");
  const [departmentFilter, setDepartmentFilter] = useState<
    "all" | number
  >("all");

  const filteredOrders = useMemo(() => {
    if (!gameState) return [] as any[];
    const allOrders = [
      ...(gameState.pendingOrders || []),
      ...(gameState.completedOrders || []),
    ];

    // Debug logging to understand the data structure
    console.log("AnalyticsScreen Debug:", {
      gameStateExists: !!gameState,
      pendingCount: gameState.pendingOrders?.length || 0,
      completedCount: gameState.completedOrders?.length || 0,
      totalOrders: allOrders.length,
      firstOrderSample: allOrders[0] ? {
        id: allOrders[0].id,
        customerId: (allOrders[0] as any).customerId,
        status: allOrders[0].status
      } : null,
      filters: { timeWindow, orderStatusFilter, departmentFilter }
    });

    // Time window cutoff (based on createdAt / completedAt using real timestamps)
    let cutoff: number | null = null;
    const now = Date.now();
    if (timeWindow !== "full") {
      const minutes =
        timeWindow === "5min"
          ? 5
          : timeWindow === "15min"
          ? 15
          : timeWindow === "30min"
          ? 30
          : 60;
      cutoff = now - minutes * 60 * 1000;
    }

    const filtered = allOrders.filter((o) => {
      // Order status filter
      if (orderStatusFilter === "completed") {
        if (!o.completedAt && o.status !== "completed-on-time" && o.status !== "completed-late") return false;
      } else if (orderStatusFilter === "active") {
        if (o.status === "completed-on-time" || o.status === "completed-late") return false;
      } else if (orderStatusFilter === "error") {
        if (o.status !== "error") return false;
      }

      // Department filter (match route contains department id)
      if (departmentFilter !== "all") {
        if (!o.route || !o.route.includes(departmentFilter as number)) return false;
      }

      // Time window filter (use createdAt or completedAt)
      if (cutoff) {
        const ts = o.completedAt ? new Date(o.completedAt).getTime() : new Date(o.createdAt).getTime();
        if (isNaN(ts) || ts < cutoff) return false;
      }

      return true;
    });

    console.log("AnalyticsScreen Filtered:", {
      originalCount: allOrders.length,
      filteredCount: filtered.length,
      sampleId: filtered[0] ? String(filtered[0].id) : 'none'
    });

    return filtered;
  }, [gameState, timeWindow, orderStatusFilter, departmentFilter]);


  // Compute live KPI cards from gameState and current filters (uses filteredOrders)
  const kpiCards = useMemo(() => {
    if (!gameState) return [] as any[];

    // Use the filtered orders as the source for KPI calculations so the cards react to Analysis Filters
    const orders = filteredOrders || [];

    // Completed orders for KPI calculations
    const completed = orders.filter(
      (o) => o.completedAt || o.status?.toString().startsWith("completed")
    );

    // Avg lead time in milliseconds (completed - created)
    const leadTimes = completed
      .map((o) => {
        try {
          const created = new Date(o.createdAt).getTime();
          const completedAt = o.completedAt ? new Date(o.completedAt).getTime() : NaN;
          if (isNaN(created) || isNaN(completedAt)) return NaN;
          return completedAt - created;
        } catch {
          return NaN;
        }
      })
      .filter((v) => !isNaN(v));

    const avgLeadTimeMs =
      leadTimes.length > 0
        ? leadTimes.reduce((s, v) => s + v, 0) / leadTimes.length
        : NaN;

    const avgLeadTimeLabel = !isNaN(avgLeadTimeMs)
      ? formatTime(avgLeadTimeMs)
      : "-";

    // On-time % (of completed orders)
    const onTimeCount = completed.filter(
      (o) => o.onTimeDelivery === true || o.status === "completed-on-time"
    ).length;
    const onTimePct = completed.length > 0 ? Math.round((onTimeCount / completed.length) * 100) : null;
    const onTimeLabel = onTimePct !== null ? `${onTimePct}%` : "-";

    // Rework rate: look for explicit reworkCount or orderType === 'rework'
    const reworkCount = completed.filter((o) => (o as any).reworkCount > 0 || o.orderType === "rework").length;
    const reworkPct = completed.length > 0 ? Math.round((reworkCount / completed.length) * 100) : null;
    const reworkLabel = reworkPct !== null ? `${reworkPct}%` : "-";

    // Bottleneck: department with highest utilization (fall back to departments list)
    let bottleneckLabel = "-";
    let bottleneckTrend = "";
    if (gameState.departments && gameState.departments.length > 0) {
      // If a department filter is active, prefer that department's utilization
      const deptList =
        departmentFilter !== "all"
          ? gameState.departments.filter((d: any) => d.id === departmentFilter)
          : gameState.departments;

      const top = deptList.reduce((best: any, d: any) => {
        if (!best || (d.utilization || 0) > (best.utilization || 0)) return d;
        return best;
      }, null as any);

      if (top) {
        bottleneckLabel = top.name || `Dept ${top.id}`;
        bottleneckTrend = `${Math.round(top.utilization || 0)}% util`;
      }
    }

    return [
      {
        title: "Avg Lead Time",
        value: avgLeadTimeLabel,
        color: "blue",
        icon: Clock,
        trend: "",
        trendUp: true,
      },
      {
        title: "On-Time %",
        value: onTimeLabel,
        color: "green",
        icon: CheckCircle,
        trend: "",
        trendUp: true,
      },
      {
        title: "Bottleneck",
        value: bottleneckLabel,
        color: "amber",
        icon: Factory,
        trend: bottleneckTrend,
        trendUp: false,
      },
      {
        title: "Rework Rate",
        value: reworkLabel,
        color: "red",
        icon: AlertTriangle,
        trend: "",
        trendUp: false,
      },
    ];
  }, [gameState, filteredOrders, departmentFilter]);

  // Helper to format lead time for an order (used in the Order Performance table)
  const formatLeadTime = (o: any) => {
    const src = o?.order || o;
    if (src?.actualLeadTime) return `${src.actualLeadTime}m`;
    if (src?.completedAt && src?.createdAt) {
      const created = new Date(src.createdAt).getTime();
      const completedAt = new Date(src.completedAt).getTime();
      if (!isNaN(created) && !isNaN(completedAt)) {
        const mins = Math.round((completedAt - created) / 60000);
        return `${mins}m`;
      }
    }
    return "-";
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
      {/* Top filter options removed per request */}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card, index) => {
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            green: "bg-green-100 text-green-600",
            amber: "bg-amber-100 text-amber-600",
            red: "bg-red-100 text-red-600",
          };

          return (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center"
            >
              <div
                className={`w-12 h-12 ${
                  colorClasses[card.color as keyof typeof colorClasses]
                } rounded-lg flex items-center justify-center mx-auto mb-3`}
              >
                <card.icon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-800">{card.title}</h4>
              <p
                className={`text-2xl font-bold mt-1 ${
                  card.color === "blue"
                    ? "text-blue-600"
                    : card.color === "green"
                    ? "text-green-600"
                    : card.color === "amber"
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {card.value}
              </p>
              <div
                className={`text-sm mt-2 flex items-center justify-center ${
                  card.trendUp ? "text-green-600" : "text-red-600"
                }`}
              >
                <span>{card.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Panels */}
      <div className="space-y-8">
        {/* Process Analysis and Performance Metrics panels removed per request */}

        {/* Analysis Filters (functional) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Analysis Filters
          </h4>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Time Window
              </label>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="5min">Last 5 minutes</option>
                <option value="15min">Last 15 minutes</option>
                <option value="30min">Last 30 minutes</option>
                <option value="1hour">Last hour</option>
                <option value="full">Full run</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Order Status
              </label>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All orders</option>
                <option value="completed">Completed only</option>
                <option value="error">Errors only</option>
                <option value="active">Active only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) =>
                  setDepartmentFilter(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All departments</option>
                {gameState &&
                  gameState.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          {/* Quick debug summary to help identify why Order ID may be empty */}
          <div className="mt-3 text-xs text-gray-500">
            Debug: {filteredOrders?.length || 0} orders, first ID: {filteredOrders?.[0] ? String((filteredOrders[0] as any).id || 'none') : 'no orders'}
          </div>
        </div>

  {/* Detailed Data Tables */}
  <div className="grid grid-cols-1 gap-8">
          {/* Order-Level Data */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Order Performance
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">Order ID</th>
                    <th className="text-left py-2 text-gray-600">Customer</th>
                    <th className="text-left py-2 text-gray-600">Priority</th>
                    <th className="text-left py-2 text-gray-600">Lead Time</th>
                    <th className="text-left py-2 text-gray-600">On Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    try {
                      return filteredOrders && filteredOrders.length > 0 ? (
                        filteredOrders.slice(0, 50).map((o, idx) => {
                          // Try multiple ways to extract the order ID
                          let orderId = 'unknown';
                          try {
                            orderId = o.id || Object.getOwnPropertyDescriptor(o, 'id')?.value || 
                                     JSON.parse(JSON.stringify(o)).id || 
                                     String(o).match(/ORD-\d+/)?.[0] || 
                                     `Order-${idx + 1}`;
                          } catch (e) {
                            orderId = `Order-${idx + 1}`;
                          }
                          
                          return (
                            <tr key={`order-${idx}`} className="border-b border-gray-100">
                              <td className="py-2 font-mono text-gray-900">{orderId}</td>
                              <td className="py-2 text-gray-700">{(o as any)?.customerName || 'Unknown'}</td>
                              <td className="py-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  (o as any)?.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                  (o as any)?.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                  (o as any)?.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {(o as any)?.priority?.toUpperCase() || 'NORMAL'}
                                </span>
                              </td>
                              <td className="py-2 text-gray-900">{formatLeadTime(o)}</td>
                              <td className="py-2">
                                {o?.status === "completed-on-time" || o?.status === "completed-late" ? (
                                  <span className={`font-medium ${o.status === "completed-on-time" ? "text-green-600" : "text-amber-600"}`}>
                                    {o.status === "completed-on-time" ? "Yes" : "Late"}
                                  </span>
                                ) : (
                                  <span className="text-gray-600">Active</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-gray-500">
                            No orders match the current filters
                          </td>
                        </tr>
                      );
                    } catch (error) {
                      console.error("Error rendering order table:", error);
                      return (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-red-500">
                            Error displaying orders: {String(error)}
                          </td>
                        </tr>
                      );
                    }
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department performance removed per user request */}
        </div>

        {/* Analysis filter controls removed per request */}
      </div>

      {/* Performance Dashboard */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Performance Dashboard
        </h2>
        {gameState ? (
          <PerformanceDashboard
            gameState={gameState}
            onExportMetrics={() => {
              console.log("Exporting performance metrics from Analytics");
              // Export comprehensive performance data
            }}
          />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800">
              Performance dashboard unavailable - no game state
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

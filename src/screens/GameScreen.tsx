import { useState } from "react";
import {
  Package,
  Factory,
  ShoppingCart,
  XCircle,
  CheckCircle,
} from "lucide-react";
import type { Order } from "../types";
import {
  RandomEventsDisplay,
  UndoRedoControls,
  RouteOptimizer,
  CapacityPlanner,
  RouteProgressIndicator,
  OrderColorDot,
} from "../components";
import { useSharedGameState } from "../contexts/GameStateContext";
import {
  sortOrdersByPriorityRule,
  getPriorityRuleInsights,
} from "../utils/priorityRules";
import { getOrderColor } from "../utils/orderColors";
import {
  getPriorityTextColor,
  getPriorityLabel,
} from "../utils/priorityColors";
import { formatOrderDueTime } from "../utils/dateUtils";
import type { PriorityRule } from "../types";

export default function GameScreen() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [activeOrderTab, setActiveOrderTab] = useState<"pending" | "completed">(
    "pending"
  );
  const [departmentPriorityRules, setDepartmentPriorityRules] = useState<{
    [key: number]: PriorityRule;
  }>({
    1: "FIFO", // Welding
    2: "FIFO", // Machining
    3: "FIFO", // Painting
    4: "FIFO", // Assembly
    5: "FIFO", // Engineering (rendered under Order Management)
  });
  const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);

  // Note: Game settings are now managed centrally in GameStateProvider

  // Use the shared game state with error handling
  let gameState,
    currentDecisionIndex,
    scheduleOrder,
    rebalanceWorkload,
    undoLastDecision,
    redoLastDecision,
    clearDecisionHistory,
    completeProcessing,
    startProcessing;
  let holdProcessing, resumeProcessing;

  try {
    const sharedState = useSharedGameState();
    gameState = sharedState.gameState;
    currentDecisionIndex = sharedState.currentDecisionIndex;
    scheduleOrder = sharedState.scheduleOrder;
    rebalanceWorkload = sharedState.rebalanceWorkload;
    undoLastDecision = sharedState.undoLastDecision;
    redoLastDecision = sharedState.redoLastDecision;
    clearDecisionHistory = sharedState.clearDecisionHistory;
    completeProcessing = sharedState.completeProcessing;
    startProcessing = sharedState.startProcessing;
    // New: hold/resume actions for manual intervention
    // Hold: pause current processing so a higher-priority order can be processed
    // Resume: move a held order back to the front of the queue (teacher/student resumes it)
    // (Both functions come from the simulation hook)
    holdProcessing = sharedState.holdProcessing;
    resumeProcessing = sharedState.resumeProcessing;
  } catch (error) {
    return (
      <div className="flex-1 p-8 bg-red-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error?.toString()}
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="text-center">Loading game state...</div>
      </div>
    );
  }

  // Game controls are now handled by GameControlsHeaderWrapper in DashboardScreen

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailDrawerOpen(true);
  };

  const handleHoldProcessing = (departmentId: number) => {
    const dept = gameState.departments.find((d) => d.id === departmentId);
    if (!dept || !dept.inProcess) return;
    // Pause current in-process order
    holdProcessing(departmentId);
  };

  const handleResumeOrder = (orderId: string) => {
    resumeProcessing(orderId);
  };

  // Batch/manual release handlers removed — students must drag orders to departments

  const handleAssignOrderToDepartment = (
    order: Order,
    departmentId: number
  ) => {
    // Check if department has capacity
    const department = gameState.departments.find((d) => d.id === departmentId);
    if (!department) return;

    // Check if this order's route includes this department
    if (!order.route.includes(departmentId)) {
      alert(
        `❌ Order ${order.id} does not include ${department.name} in its route.\n\n` +
          `Route: ${order.route
            .map((id) => {
              const d = gameState.departments.find((dept) => dept.id === id);
              return d ? d.name : `Dept ${id}`;
            })
            .join(" → ")}`
      );
      return;
    }

    // Check if this department step was already completed
    const completedDepartments = order.timestamps
      .filter((t) => t.end) // Only timestamps with end time are completed
      .map((t) => t.deptId);

    if (completedDepartments.includes(departmentId)) {
      alert(
        `⚠️ Order ${order.id} has already completed ${department.name}!\n\n` +
          `Each department can only process an order once.\n\n` +
          `Completed steps: ${completedDepartments
            .map((id) => {
              const d = gameState.departments.find((dept) => dept.id === id);
              return d ? d.name : `Dept ${id}`;
            })
            .join(" → ")}`
      );
      return;
    }

    // Check if Engineering (id=5) must be first and hasn't been completed yet
    const requiresEngineering = order.route.includes(5);
    const engineeringCompleted = completedDepartments.includes(5);
    const hasStartedProcessing = completedDepartments.length > 0;

    if (
      requiresEngineering &&
      !engineeringCompleted &&
      departmentId !== 5 &&
      hasStartedProcessing
    ) {
      // Already started processing but Engineering not done yet - shouldn't happen
      alert(
        `⚠️ Order ${order.id} requires Engineering approval first!\n\n` +
          `This order cannot proceed to ${department.name} until Engineering has completed their review.`
      );
      return;
    }

    if (
      requiresEngineering &&
      !engineeringCompleted &&
      departmentId !== 5 &&
      !hasStartedProcessing
    ) {
      // First assignment attempt to non-Engineering department
      const engineeringDept = gameState.departments.find((d) => d.id === 5);
      alert(
        `🔧 Order ${order.id} requires Engineering approval first!\n\n` +
          `This order must start at ${
            engineeringDept?.name || "Engineering"
          } before moving to other departments.\n\n` +
          `Route: ${order.route
            .map((id) => {
              const d = gameState.departments.find((dept) => dept.id === id);
              return d ? d.name : `Dept ${id}`;
            })
            .join(" → ")}`
      );
      return;
    }

    // Check capacity
    if (department.wipCount >= department.maxQueueSize) {
      alert(
        `${department.name} is at maximum capacity (${department.maxQueueSize} orders). Cannot assign more orders.`
      );
      return;
    }

    // For manual mode, allow students to assign pending orders directly to any department in their route
    console.log(`Manually assigning order ${order.id} to ${department.name}`);

    // This would typically be handled by a game action
    // For now, we'll simulate the assignment
    scheduleOrder(order.id, departmentId, new Date());
  };

  const handleChangePriorityRule = (
    departmentId: number,
    newRule: PriorityRule
  ) => {
    setDepartmentPriorityRules((prev) => ({
      ...prev,
      [departmentId]: newRule,
    }));

    // Show educational feedback about the change
    const department = gameState.departments.find((d) => d.id === departmentId);
    if (department) {
      const insights = getPriorityRuleInsights(newRule);
      console.log(
        `Changed ${department.name} to ${newRule}:`,
        insights.bestFor
      );
    }
  };

  const handleDragStart = (order: Order) => {
    setDraggedOrder(order);
  };

  const handleDragEnd = () => {
    setDraggedOrder(null);
  };

  const handleDropOnDepartment = (departmentId: number) => {
    if (draggedOrder) {
      handleAssignOrderToDepartment(draggedOrder, departmentId);
      setDraggedOrder(null);
    }
  };

  const handleCompleteProcessing = (departmentId: number) => {
    const dept = gameState.departments.find((d) => d.id === departmentId);
    if (!dept || !dept.inProcess) return;

    const processingOrder = dept.inProcess;

    // Check if processing timer has finished
    const timeRemaining = processingOrder.processingTimeRemaining || 0;
    if (timeRemaining > 0) {
      alert(
        `⏱️ Processing not yet complete!\n\n` +
          `Order ${processingOrder.id} still needs ${formatTime(
            timeRemaining
          )} to finish processing in ${dept.name}.\n\n` +
          `Please wait for the timer to reach 00:00 before completing.`
      );
      return;
    }

    console.log(
      `Manually completing processing of order ${processingOrder.id} in ${dept.name}`
    );

    // Find which step this department represents in the order's route
    const currentRouteStepIndex = processingOrder.route.indexOf(departmentId);
    if (currentRouteStepIndex === -1) {
      console.error(
        `Department ${departmentId} not found in order ${processingOrder.id} route`
      );
      return;
    }

    // Check if this is the last step in the route
    const isLastStep =
      currentRouteStepIndex >= processingOrder.route.length - 1;

    if (isLastStep) {
      // Order is fully completed - mark as done
      alert(
        `🎉 Order ${processingOrder.id} has completed ALL manufacturing steps!\n\nThis order is now FINISHED and will be moved to completed orders.`
      );
    } else {
      // Order needs more processing - show which departments are remaining
      const completedSteps = processingOrder.route.slice(
        0,
        currentRouteStepIndex + 1
      );
      const remainingSteps = processingOrder.route.slice(
        currentRouteStepIndex + 1
      );

      const completedDeptNames = completedSteps
        .map((id) => {
          const dept = gameState.departments.find((d) => d.id === id);
          return dept?.name || `Dept ${id}`;
        })
        .join(" → ");

      const remainingDeptNames = remainingSteps
        .map((id) => {
          const dept = gameState.departments.find((d) => d.id === id);
          return dept?.name || `Dept ${id}`;
        })
        .join(" → ");

      alert(
        `✅ Order ${processingOrder.id} completed: ${dept.name}\n\n` +
          `✓ Completed: ${completedDeptNames}\n` +
          `→ Still needs: ${remainingDeptNames}\n\n` +
          `The order will return to Order Management so you can manually assign it to the next department.`
      );
    }

    // Use the proper complete processing function
    completeProcessing(departmentId);
  };

  const handleStartProcessing = (departmentId: number) => {
    const dept = gameState.departments.find((d) => d.id === departmentId);
    if (!dept || dept.inProcess || dept.queue.length === 0) return;

    // Get the first order from the queue (FIFO by default)
    const nextOrder = dept.queue[0];
    console.log(
      `Manually starting processing of order ${nextOrder.id} in ${dept.name}`
    );

    // Start processing the next order in the queue
    startProcessing(departmentId);

    // Show educational feedback
    alert(
      `🔄 Started processing Order ${nextOrder.id} in ${dept.name}\n\n` +
        `Processing time: ${formatTime(nextOrder.processingTimeRemaining)}\n` +
        `Priority: ${nextOrder.priority.toUpperCase()}\n\n` +
        `Click "Complete Processing" when you're ready to finish this step.`
    );
  };

  const getSLAStatusColor = (order: Order) => {
    switch (order.slaStatus) {
      case "overdue":
        return "bg-red-500 text-white";
      case "at-risk":
        return "bg-amber-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  const formatTime = (milliseconds?: number) => {
    if (!milliseconds) return "--";
    const minutes = Math.floor(milliseconds / (60 * 1000));
    const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
      {/* Random Events Display */}
      <RandomEventsDisplay
        events={gameState.gameEvents}
        onDismissEvent={(eventId) => {
          console.log("Dismissing event:", eventId);
        }}
      />

      {/* Main Production Layout - Order Management (Left) + Manufacturing Departments (Right) */}
      <div className="mb-8 grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Left Side - Order Management */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 min-h-[500px] flex flex-col">
            {/* Header with Tabs */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Order Management
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Track orders from request to completion
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Package className="w-8 h-8 text-green-600" />
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Order Management Tabs */}
            <div className="mb-4">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveOrderTab("pending")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeOrderTab === "pending"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Pending Orders ({gameState.pendingOrders.length})
                  </button>
                  <button
                    onClick={() => setActiveOrderTab("completed")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeOrderTab === "completed"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Completed Orders ({gameState.completedOrders.length})
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeOrderTab === "pending" && (
              <>
                {/* Quick Actions removed — manual drag-only release enforced */}
                <div className="flex items-center justify-between mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Order Release
                    </p>
                    <p className="text-xs text-blue-700">
                      Scheduled and pending orders must be started by dragging
                      them onto a department. Automatic or batch release has
                      been disabled to encourage student decision-making.
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3 space-y-1">
                  <div>
                    <strong>Instructions:</strong> Drag orders from the Pending
                    list to the department where you want processing to start.
                    Automatic release has been disabled.
                  </div>
                  {gameState.session.settings.manualMode && (
                    <div className="text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                      <strong>Manual Mode:</strong> Drag orders to departments
                      to assign them. Use the Start/Complete buttons inside the
                      department panels to progress work.
                    </div>
                  )}
                </div>

                {/* Pending Orders Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 flex-1 overflow-y-auto min-h-0">
                  {gameState.pendingOrders.slice(0, 24).map((order) => {
                    const orderColor = getOrderColor(order.id);
                    return (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={() => handleDragStart(order)}
                        onDragEnd={handleDragEnd}
                        className={`p-2 rounded-lg border border-gray-200 bg-white transition-all duration-200 ${
                          draggedOrder?.id === order.id
                            ? "opacity-50 scale-95 rotate-2 shadow-lg"
                            : "hover:shadow-md cursor-grab active:cursor-grabbing hover:scale-105"
                        } relative group`}
                        style={{
                          borderTopColor: orderColor.dot,
                          borderTopWidth: "4px",
                        }}
                      >
                        {/* Color Dot + Compact Header */}
                        <div className="mb-1.5">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center space-x-2">
                              <OrderColorDot orderId={order.id} size="sm" />
                              <span className="font-mono text-xs font-semibold text-gray-800">
                                {order.id}
                              </span>
                            </div>
                            <span
                              className={`text-xs px-1 py-0.5 rounded text-white font-medium ${getSLAStatusColor(
                                order
                              )}`}
                            >
                              {order.slaStatus === "on-track"
                                ? "OK"
                                : order.slaStatus === "at-risk"
                                ? "RISK"
                                : "LATE"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1">
                              <span
                                className={`px-1 py-0.5 rounded font-medium ${
                                  order.priority === "urgent"
                                    ? "bg-red-100 text-red-800"
                                    : order.priority === "high"
                                    ? "bg-orange-100 text-orange-800"
                                    : order.priority === "normal"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-green-50 text-green-700"
                                }`}
                              >
                                {getPriorityLabel(order.priority)}
                              </span>
                              {order.isHalfOrder && (
                                <span className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded font-medium">
                                  HALF
                                </span>
                              )}
                            </div>
                            {(() => {
                              const currentElapsedMinutes = Math.floor(
                                gameState.session.elapsedTime / 60000
                              );
                              const dueInfo = formatOrderDueTime(
                                order.dueGameMinutes,
                                order.priority,
                                currentElapsedMinutes
                              );
                              return (
                                <span
                                  className={`text-xs font-medium ${
                                    dueInfo.isOverdue
                                      ? "text-red-600"
                                      : dueInfo.timeRemaining < 2
                                      ? "text-orange-600"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {dueInfo.display}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Route Progress */}
                        <div className="mb-1.5">
                          <RouteProgressIndicator order={order} size="sm" />
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-1">
                          <div className="w-full text-xs text-gray-600 p-2 rounded bg-gray-50 text-center">
                            Drag this order to a department to start processing
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openOrderDetail(order);
                            }}
                            className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {gameState.pendingOrders.length === 0 && (
                    <div className="col-span-full text-gray-500 text-center py-8">
                      No incoming orders
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Completed Orders Tab */}
            {activeOrderTab === "completed" && (
              <>
                <div className="text-sm text-gray-600 mb-3">
                  <div>
                    <strong>Completed Orders:</strong> Track your manufacturing
                    success and learn from completed orders.
                  </div>
                </div>

                {/* Completed Orders Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 flex-1 overflow-y-auto min-h-0">
                  {gameState.completedOrders
                    .slice(-24)
                    .reverse()
                    .map((order) => {
                      const orderColor = getOrderColor(order.id);
                      return (
                        <div
                          key={order.id}
                          onClick={() => openOrderDetail(order)}
                          className="p-2 rounded-lg border border-gray-200 bg-white cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
                          style={{
                            borderTopColor: orderColor.dot,
                            borderTopWidth: "4px",
                          }}
                        >
                          {/* Color Dot + Header */}
                          <div className="mb-1.5">
                            <div className="flex items-center justify-between mb-0.5">
                              <div className="flex items-center space-x-2">
                                <OrderColorDot orderId={order.id} size="sm" />
                                <span className="font-mono text-xs font-semibold text-gray-800">
                                  {order.id}
                                </span>
                              </div>
                              <span
                                className={`text-xs px-1 py-0.5 rounded text-white font-medium ${
                                  order.status === "completed-on-time"
                                    ? "bg-green-500"
                                    : "bg-amber-500"
                                }`}
                              >
                                {order.status === "completed-on-time"
                                  ? "ON TIME"
                                  : "LATE"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-1">
                                <span
                                  className={`px-1 py-0.5 rounded font-medium ${
                                    order.priority === "urgent"
                                      ? "bg-red-100 text-red-800"
                                      : order.priority === "high"
                                      ? "bg-orange-100 text-orange-800"
                                      : order.priority === "normal"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-green-50 text-green-700"
                                  }`}
                                >
                                  {getPriorityLabel(order.priority)}
                                </span>
                                <span className="text-gray-600">
                                  Lead: {order.actualLeadTime || 0}min
                                </span>
                              </div>
                              <span className="text-gray-600">
                                {order.completedAt?.toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Route Progress (All completed) */}
                          <div className="mb-1.5">
                            <RouteProgressIndicator order={order} size="sm" />
                          </div>

                          {/* Customer */}
                          <div className="text-xs text-gray-600 text-center">
                            {order.customerName}
                          </div>
                        </div>
                      );
                    })}
                  {gameState.completedOrders.length === 0 && (
                    <div className="col-span-full text-gray-500 text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No completed orders yet</p>
                      <p className="text-sm">
                        Start processing orders to see them here!
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Engineering panel (under Order Management) */}
          {(() => {
            const eng = gameState.departments.find((d) => d.id === 5);
            if (!eng) return null;
            const sortedQueue = sortOrdersByPriorityRule(
              eng.queue,
              departmentPriorityRules[eng.id]
            );
            const capacityPercentage = (eng.wipCount / eng.maxQueueSize) * 100;
            const isCompleted = draggedOrder
              ? draggedOrder.timestamps.some(
                  (t) => t.deptId === eng.id && t.end
                )
              : false;

            return (
              <div className="mt-4">
                <div
                  className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all duration-300 min-h-[160px] relative ${
                    draggedOrder && isCompleted
                      ? "border-gray-400 bg-gray-200 opacity-50 cursor-not-allowed"
                      : draggedOrder && draggedOrder.route.includes(eng.id)
                      ? "border-green-500 bg-green-50 shadow-lg scale-105 ring-2 ring-green-200"
                      : draggedOrder && !draggedOrder.route.includes(eng.id)
                      ? "border-red-300 bg-red-50 opacity-60"
                      : "border-gray-200"
                  } ${
                    capacityPercentage > 90 ? "border-red-300 bg-red-50" : ""
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDropOnDepartment(eng.id);
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                          #{eng.id}
                        </span>
                        <h4 className="text-lg font-semibold text-gray-800">
                          Engineering
                        </h4>
                      </div>
                      <div className="text-xs text-gray-600">
                        Engineering review & approvals
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={departmentPriorityRules[eng.id]}
                        onChange={(e) =>
                          handleChangePriorityRule(
                            eng.id,
                            e.target.value as PriorityRule
                          )
                        }
                        className="text-xs p-1 border-2 border-purple-400 rounded-md bg-purple-100 text-purple-800 font-medium hover:bg-purple-200 focus:bg-purple-200 focus:border-purple-500 transition-colors"
                        title="Priority Rule"
                      >
                        <option value="FIFO">FIFO</option>
                        <option value="EDD">EDD</option>
                        <option value="SPT">SPT</option>
                      </select>
                      <div className="text-sm text-gray-600">
                        WIP {eng.wipCount}/{eng.maxQueueSize}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Queue ({sortedQueue.length})
                  </div>
                  {sortedQueue.length > 0 ? (
                    <div className="space-y-2 max-h-28 overflow-y-auto">
                      {sortedQueue.map((order, idx) => {
                        const orderColor = getOrderColor(order.id);
                        return (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-2 rounded border border-gray-200 bg-white text-xs"
                            style={{
                              borderTopColor: orderColor.dot,
                              borderTopWidth: "3px",
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </span>
                              <OrderColorDot orderId={order.id} size="xs" />
                              <span className="font-medium">{order.id}</span>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-xs font-medium ${getPriorityTextColor(
                                  order.priority
                                )}`}
                              >
                                {getPriorityLabel(order.priority)}
                              </div>
                              {/* Resume button for held orders */}
                              {order.status === "on-hold" && (
                                <div className="mt-1">
                                  <button
                                    onClick={() => handleResumeOrder(order.id)}
                                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                                  >
                                    Resume
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4 text-xs">
                      No engineering tasks
                    </div>
                  )}

                  {gameState.session.settings.manualMode &&
                    !eng.inProcess &&
                    sortedQueue.length > 0 && (
                      <button
                        onClick={() => handleStartProcessing(eng.id)}
                        className="mt-3 w-full bg-green-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                      >
                        Start Processing {sortedQueue[0].id}
                      </button>
                    )}

                  {eng.inProcess && (
                    <div className="mt-2 p-2 border rounded-lg bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <OrderColorDot orderId={eng.inProcess.id} size="sm" />
                          <span className="text-sm font-medium text-blue-900">
                            Processing: {eng.inProcess.id}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            (eng.inProcess.processingTimeRemaining || 0) > 0
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {(eng.inProcess.processingTimeRemaining || 0) > 0
                            ? formatTime(eng.inProcess.processingTimeRemaining)
                            : "READY ✅"}
                        </span>
                      </div>

                      {/* Small progress bar */}
                      {(() => {
                        const timeRemaining =
                          eng.inProcess.processingTimeRemaining || 0;
                        const totalTime = eng.inProcess.processingTime || 1;
                        const progress = Math.max(
                          0,
                          Math.min(
                            100,
                            ((totalTime - timeRemaining) / totalTime) * 100
                          )
                        );
                        return (
                          <div className="mb-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-1000 ${
                                  progress >= 100
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="text-xs mb-2">
                        <span className="text-blue-700">Priority: </span>
                        <span
                          className={`font-medium ${getPriorityTextColor(
                            eng.inProcess.priority
                          )}`}
                        >
                          {getPriorityLabel(eng.inProcess.priority)}
                        </span>
                      </div>

                      {(() => {
                        const timeRemaining =
                          eng.inProcess.processingTimeRemaining || 0;
                        const isComplete = timeRemaining <= 0;
                        return (
                          <div className="space-y-2">
                            {/* Hold button allows pausing current work so another order can run */}
                            {!isComplete && (
                              <button
                                onClick={() => handleHoldProcessing(eng.id)}
                                className={`mt-2 w-full px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800 hover:bg-gray-300`}
                              >
                                ⏸ Hold (pause)
                              </button>
                            )}
                            <button
                              onClick={() => handleCompleteProcessing(eng.id)}
                              disabled={!isComplete}
                              className={`mt-2 w-full px-3 py-1 rounded text-xs font-medium transition-colors ${
                                isComplete
                                  ? "bg-green-600 text-white hover:bg-green-700 animate-pulse"
                                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
                              }`}
                            >
                              {isComplete
                                ? "✅ Complete Processing"
                                : `⏳ Processing... (${formatTime(
                                    timeRemaining
                                  )})`}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Side - Manufacturing Departments */}
        <div className="xl:col-span-3">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Manufacturing Departments
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gameState.departments
              .filter((d) => d.id !== 5)
              .map((dept) => {
                const priorityRule = departmentPriorityRules[dept.id];
                const sortedQueue = sortOrdersByPriorityRule(
                  dept.queue,
                  priorityRule
                );
                const capacityPercentage =
                  (dept.wipCount / dept.maxQueueSize) * 100;

                const isCompleted = draggedOrder
                  ? draggedOrder.timestamps.some(
                      (t) => t.deptId === dept.id && t.end
                    )
                  : false;

                // Check if Engineering must be completed first
                const requiresEngineering =
                  draggedOrder?.route.includes(5) ?? false;
                const engineeringCompleted = draggedOrder
                  ? draggedOrder.timestamps.some((t) => t.deptId === 5 && t.end)
                  : false;
                const blockedByEngineering =
                  requiresEngineering && !engineeringCompleted && dept.id !== 5;

                return (
                  <div
                    key={dept.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropOnDepartment(dept.id);
                    }}
                    className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-300 min-h-[380px] relative ${
                      draggedOrder && (isCompleted || blockedByEngineering)
                        ? "border-gray-400 bg-gray-200 opacity-50 cursor-not-allowed"
                        : draggedOrder && draggedOrder.route.includes(dept.id)
                        ? "border-green-500 bg-green-50 shadow-lg scale-105 ring-2 ring-green-200"
                        : draggedOrder && !draggedOrder.route.includes(dept.id)
                        ? "border-red-300 bg-red-50 opacity-60"
                        : draggedOrder
                        ? "border-gray-300 bg-gray-100 opacity-80"
                        : "border-gray-200"
                    } ${
                      capacityPercentage > 90 ? "border-red-300 bg-red-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                            #{dept.id}
                          </span>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {dept.name}
                          </h3>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {dept.standardProcessingTime}min processing time
                        </div>
                        {blockedByEngineering && (
                          <div className="mt-2 flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-md border border-orange-300">
                            <span>🔧</span>
                            <span>Awaiting Engineering approval</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Factory className="w-8 h-8 text-purple-600" />
                        <select
                          value={priorityRule}
                          onChange={(e) =>
                            handleChangePriorityRule(
                              dept.id,
                              e.target.value as PriorityRule
                            )
                          }
                          className="text-xs p-1 border-2 border-purple-400 rounded-md bg-purple-100 text-purple-800 font-medium hover:bg-purple-200 focus:bg-purple-200 focus:border-purple-500 transition-colors"
                          title="Priority Rule"
                        >
                          <option value="FIFO">FIFO</option>
                          <option value="EDD">EDD</option>
                          <option value="SPT">SPT</option>
                        </select>
                      </div>
                    </div>

                    {/* WIP Capacity Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">
                          WIP Capacity
                        </span>
                        <span className="text-gray-600">
                          {dept.wipCount}/{dept.maxQueueSize}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            capacityPercentage > 90
                              ? "bg-red-500"
                              : capacityPercentage > 75
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(capacityPercentage, 100)}%`,
                          }}
                        ></div>
                      </div>

                      {/* Queue Statistics */}
                      <div className="grid grid-cols-3 gap-4 text-center text-xs">
                        <div>
                          <div className="font-medium text-gray-600">Queue</div>
                          <div className="text-lg font-bold text-gray-800">
                            {dept.queue.length}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-600">
                            Processing
                          </div>
                          <div className="text-lg font-bold text-gray-800">
                            {dept.inProcess ? 1 : 0}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-600">
                            Utilization
                          </div>
                          <div className="text-lg font-bold text-gray-800">
                            {Math.round(capacityPercentage)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Currently Processing Order */}
                    {dept.inProcess &&
                      (() => {
                        const orderColor = getOrderColor(dept.inProcess.id);
                        return (
                          <div
                            className={`mb-4 p-3 border rounded-lg transition-all ${
                              (dept.inProcess.processingTimeRemaining || 0) > 0
                                ? "bg-white border-gray-200"
                                : "bg-green-50 border-green-300"
                            }`}
                            style={
                              (dept.inProcess.processingTimeRemaining || 0) > 0
                                ? {
                                    borderTopColor: orderColor.dot,
                                    borderTopWidth: "4px",
                                  }
                                : undefined
                            }
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <OrderColorDot
                                  orderId={dept.inProcess.id}
                                  size="sm"
                                />
                                <span className="text-sm font-medium text-blue-900">
                                  Processing: {dept.inProcess.id}
                                </span>
                              </div>
                              <span
                                className={`text-xs font-bold ${
                                  (dept.inProcess.processingTimeRemaining ||
                                    0) > 0
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }`}
                              >
                                {(dept.inProcess.processingTimeRemaining || 0) >
                                0
                                  ? formatTime(
                                      dept.inProcess.processingTimeRemaining
                                    )
                                  : "READY ✅"}
                              </span>
                            </div>

                            {/* Progress Bar */}
                            {(() => {
                              const timeRemaining =
                                dept.inProcess.processingTimeRemaining || 0;
                              const totalTime =
                                dept.inProcess.processingTime || 1;
                              const progress = Math.max(
                                0,
                                Math.min(
                                  100,
                                  ((totalTime - timeRemaining) / totalTime) *
                                    100
                                )
                              );

                              return (
                                <div className="mb-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-1000 ${
                                        progress >= 100
                                          ? "bg-green-500"
                                          : "bg-blue-500"
                                      }`}
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })()}

                            <div className="text-xs">
                              <span className="text-blue-700">Priority: </span>
                              <span
                                className={`font-medium ${getPriorityTextColor(
                                  dept.inProcess.priority
                                )}`}
                              >
                                {getPriorityLabel(dept.inProcess.priority)}
                              </span>
                            </div>
                            {(() => {
                              const timeRemaining =
                                dept.inProcess.processingTimeRemaining || 0;
                              const isComplete = timeRemaining <= 0;

                              return (
                                <div className="space-y-2">
                                  {/* Hold button allows pausing current work so another order can run */}
                                  {!isComplete && (
                                    <button
                                      onClick={() =>
                                        handleHoldProcessing(dept.id)
                                      }
                                      className={`mt-2 w-full px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800 hover:bg-gray-300`}
                                    >
                                      ⏸ Hold (pause)
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleCompleteProcessing(dept.id)
                                    }
                                    disabled={!isComplete}
                                    className={`mt-2 w-full px-3 py-1 rounded text-xs font-medium transition-colors ${
                                      isComplete
                                        ? "bg-green-600 text-white hover:bg-green-700 animate-pulse"
                                        : "bg-gray-400 text-gray-600 cursor-not-allowed"
                                    }`}
                                  >
                                    {isComplete
                                      ? "✅ Complete Processing"
                                      : `⏳ Processing... (${formatTime(
                                          timeRemaining
                                        )})`}
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })()}

                    {/* Queue Display */}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Queue ({sortedQueue.length} orders)
                      </div>
                      {sortedQueue.length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {sortedQueue.map((order, index) => {
                            const orderColor = getOrderColor(order.id);
                            return (
                              <div
                                key={order.id}
                                className="flex items-center justify-between p-2 rounded border border-gray-200 bg-white text-xs transition-all"
                                style={{
                                  borderTopColor: orderColor.dot,
                                  borderTopWidth: "3px",
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </span>
                                  <OrderColorDot orderId={order.id} size="xs" />
                                  <span className="font-medium">
                                    {order.id}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div
                                    className={`text-xs px-1 py-0.5 rounded text-white font-medium ${getSLAStatusColor(
                                      order
                                    )}`}
                                  >
                                    {order.slaStatus === "on-track"
                                      ? "OK"
                                      : order.slaStatus === "at-risk"
                                      ? "RISK"
                                      : "LATE"}
                                  </div>
                                  <div
                                    className={`text-xs font-medium mt-0.5 ${getPriorityTextColor(
                                      order.priority
                                    )}`}
                                  >
                                    {getPriorityLabel(order.priority)}
                                  </div>
                                  {/* Resume button for held orders */}
                                  {order.status === "on-hold" && (
                                    <div className="mt-2">
                                      <button
                                        onClick={() =>
                                          handleResumeOrder(order.id)
                                        }
                                        className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                                      >
                                        Resume
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-center py-4 text-xs">
                          No orders to process
                        </div>
                      )}

                      {/* Manual Mode: Start Processing Button */}
                      {gameState.session.settings.manualMode &&
                        !dept.inProcess &&
                        sortedQueue.length > 0 && (
                          <button
                            onClick={() => handleStartProcessing(dept.id)}
                            className="mt-3 w-full bg-green-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                          >
                            Start Processing Order {sortedQueue[0].id}
                          </button>
                        )}
                    </div>

                    {/* Enhanced Drag-and-Drop Overlay */}
                    {draggedOrder && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {draggedOrder.route.includes(dept.id) ? (
                          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg text-center animate-pulse">
                            <div className="font-bold text-lg">✓ Drop Here</div>
                            <div className="text-sm">
                              Valid department for {draggedOrder.id}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg text-center">
                            <div className="font-bold text-lg">✗ Invalid</div>
                            <div className="text-sm">
                              {draggedOrder.id} cannot go here
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Decision History */}
      <div className="mb-8">
        <UndoRedoControls
          decisions={gameState.decisions}
          currentDecisionIndex={currentDecisionIndex}
          onUndo={undoLastDecision}
          onRedo={redoLastDecision}
          onClearHistory={clearDecisionHistory}
        />
      </div>

      {/* Route Optimizer - Only show if advanced routing is enabled */}
      {gameState.session.settings.enableAdvancedRouting && (
        <div className="mb-8">
          <RouteOptimizer
            orders={[
              ...gameState.pendingOrders,
              ...gameState.departments.flatMap((d) => [
                ...d.queue,
                ...(d.inProcess ? [d.inProcess] : []),
              ]),
            ]}
            departments={gameState.departments}
            onSelectAlternativeRoute={(orderId, routeIndex) => {
              console.log(
                "Selecting alternative route for order:",
                orderId,
                "route index:",
                routeIndex
              );
            }}
          />
        </div>
      )}

      {/* Capacity Planner */}
      <div className="mb-8">
        <CapacityPlanner
          gameState={gameState}
          onRebalanceWorkload={(plan) => {
            rebalanceWorkload(
              plan.sourceIds,
              plan.targetIds,
              plan.ordersToMove
            );
          }}
        />
      </div>

      {/* Order Detail Drawer */}
      {detailDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">
                Order Details: {selectedOrder?.id}
              </h3>
              <button
                onClick={() => setDetailDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <XCircle size={28} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-3">
                  Route Progress
                </label>
                <RouteProgressIndicator
                  order={selectedOrder}
                  size="lg"
                  showLabels={true}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Due
                </label>
                {(() => {
                  const currentElapsedMinutes = Math.floor(
                    gameState.session.elapsedTime / 60000
                  );
                  const dueInfo = formatOrderDueTime(
                    selectedOrder.dueGameMinutes,
                    selectedOrder.priority,
                    currentElapsedMinutes
                  );
                  return (
                    <p
                      className={`text-lg font-medium ${
                        dueInfo.isOverdue
                          ? "text-red-600"
                          : dueInfo.timeRemaining < 2
                          ? "text-orange-600"
                          : "text-gray-900"
                      }`}
                    >
                      {dueInfo.display}
                    </p>
                  );
                })()}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedOrder.status === "completed-on-time"
                      ? "bg-green-100 text-green-800"
                      : selectedOrder.status === "completed-late"
                      ? "bg-amber-100 text-amber-800"
                      : selectedOrder.status === "error"
                      ? "bg-red-100 text-red-800"
                      : selectedOrder.status === "processing"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedOrder.status.charAt(0).toUpperCase() +
                    selectedOrder.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Lead Time
                </label>
                <p className="text-lg">
                  {selectedOrder.actualLeadTime || "--"} minutes
                </p>
              </div>
            </div>

            {/* Half Order Information */}
            {selectedOrder.isHalfOrder && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">
                  Half Order Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-purple-800 block">
                      Reason:
                    </label>
                    <p className="text-purple-700">
                      {selectedOrder.halfOrderReason
                        ?.replace("_", " ")
                        .toUpperCase() || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-purple-800 block">
                      Processing Time:
                    </label>
                    <p className="text-purple-700">
                      {Math.round(
                        (selectedOrder.processingTimeMultiplier || 1) * 100
                      )}
                      % of normal
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <label className="font-medium text-purple-800 block">
                    Special Instructions:
                  </label>
                  <p className="text-purple-700">
                    {selectedOrder.specialInstructions || "None"}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-600 mb-3 block">
                Timeline
              </label>
              <div className="space-y-3">
                {selectedOrder.timestamps.length > 0 ? (
                  selectedOrder.timestamps.map((timestamp, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {timestamp.deptId}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Department {timestamp.deptId}
                          </p>
                          <p className="text-sm text-gray-500">
                            {timestamp.start.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Duration:{" "}
                          {timestamp.end
                            ? Math.round(
                                (timestamp.end.getTime() -
                                  timestamp.start.getTime()) /
                                  (1000 * 60)
                              )
                            : 0}
                          min
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No timeline data available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

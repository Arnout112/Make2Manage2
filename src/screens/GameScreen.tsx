import { useState } from "react";
import { Package, Factory, ShoppingCart, Play, XCircle } from "lucide-react";
import type { Order } from "../types";
import {
  RandomEventsDisplay,
  UndoRedoControls,
  RouteOptimizer,
  CapacityPlanner,
} from "../components";
import { useSharedGameState } from "../contexts/GameStateContext";
import {
  sortOrdersByPriorityRule,
  getPriorityRuleInsights,
} from "../utils/priorityRules";
import type { PriorityRule } from "../types";

export default function GameScreen() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [departmentPriorityRules, setDepartmentPriorityRules] = useState<{
    [key: number]: PriorityRule;
  }>({
    1: "FIFO", // Welding
    2: "FIFO", // Machining
    3: "FIFO", // Painting
    4: "FIFO", // Assembly
  });
  const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);

  // Note: Game settings are now managed centrally in GameStateProvider

  // Use the shared game state with error handling
  let gameState,
    currentDecisionIndex,
    releaseOrder,
    scheduleOrder,
    rebalanceWorkload,
    undoLastDecision,
    redoLastDecision,
    clearDecisionHistory;

  try {
    const sharedState = useSharedGameState();
    gameState = sharedState.gameState;
    currentDecisionIndex = sharedState.currentDecisionIndex;
    releaseOrder = sharedState.releaseOrder;
    scheduleOrder = sharedState.scheduleOrder;
    rebalanceWorkload = sharedState.rebalanceWorkload;
    undoLastDecision = sharedState.undoLastDecision;
    redoLastDecision = sharedState.redoLastDecision;
    clearDecisionHistory = sharedState.clearDecisionHistory;
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

  const handleReleaseOrder = (orderId: string) => {
    releaseOrder(orderId);
  };

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
        `Order ${order.id} does not include ${department.name} in its route.`
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
      console.log(
        `Order ${processingOrder.id} has completed all manufacturing steps`
      );
      alert(
        `🎉 Order ${processingOrder.id} has completed ALL manufacturing steps!\n\nThis order is now FINISHED and will be moved to completed orders.`
      );

      // Complete the order - this should move it to completed orders
      scheduleOrder(processingOrder.id, departmentId, new Date());
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

      console.log(
        `Order ${processingOrder.id} completed ${dept.name}. Remaining: ${remainingDeptNames}`
      );

      alert(
        `✅ Order ${processingOrder.id} completed: ${dept.name}\n\n` +
          `✓ Completed: ${completedDeptNames}\n` +
          `→ Still needs: ${remainingDeptNames}\n\n` +
          `The order will return to Order Management so you can manually assign it to the next department.`
      );

      // Complete current step - the order should return to pending orders automatically
      // We'll complete processing at this department, which should trigger the order
      // to move back to pending status for manual re-assignment
      scheduleOrder(processingOrder.id, departmentId, new Date());
    }
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Order Management ({gameState.pendingOrders.length} pending)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Customer orders waiting for production planning and release
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Package className="w-8 h-8 text-green-600" />
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Quick Actions
                </p>
                <p className="text-xs text-blue-700">
                  Approve and release customer orders for production
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // Release all orders that can fit in factory capacity
                    const availableCapacity = gameState.departments.reduce(
                      (total, dept) =>
                        total + (dept.maxQueueSize - dept.wipCount),
                      0
                    );
                    const ordersToRelease = Math.min(
                      gameState.pendingOrders.length,
                      availableCapacity,
                      3
                    );
                    for (let i = 0; i < ordersToRelease; i++) {
                      if (gameState.pendingOrders[i]) {
                        handleReleaseOrder(gameState.pendingOrders[i].id);
                      }
                    }
                  }}
                  disabled={
                    gameState.pendingOrders.length === 0 ||
                    gameState.session.status !== "running" ||
                    gameState.departments.every(
                      (dept) => dept.wipCount >= dept.maxQueueSize
                    )
                  }
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
                >
                  <Package size={16} />
                  <span>Batch Release (Up to 3)</span>
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <strong>Instructions:</strong> Each customer order needs to be{" "}
              <strong>released to production</strong> before manufacturing can
              begin. Click "Release to Production" to approve an order and send
              it to the first department in its route.
            </div>

            {/* Compact Grid Layout - Multiple rows of cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 flex-1 overflow-y-auto min-h-0">
              {gameState.pendingOrders.slice(0, 24).map((order) => (
                <div
                  key={order.id}
                  draggable
                  onDragStart={() => handleDragStart(order)}
                  onDragEnd={handleDragEnd}
                  className={`p-2 bg-gray-50 rounded-lg border transition-all duration-200 ${
                    draggedOrder?.id === order.id
                      ? "opacity-50 scale-95"
                      : "hover:bg-gray-100 cursor-grab active:cursor-grabbing"
                  }`}
                >
                  {/* Compact Header with ID, Priority, Due Date, and SLA Status */}
                  <div className="mb-1.5">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-mono text-xs font-semibold text-gray-800">
                        {order.id}
                      </span>
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
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.priority === "urgent"
                            ? "URG"
                            : order.priority === "high"
                            ? "HIGH"
                            : order.priority === "normal"
                            ? "NORM"
                            : "LOW"}
                        </span>
                        {order.isHalfOrder && (
                          <span className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded font-medium">
                            HALF
                          </span>
                        )}
                      </div>
                      <span className="text-gray-600">
                        {order.dueDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="mb-1.5">
                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                      {order.route.join("→")}
                    </div>
                  </div>

                  {/* Action Buttons - Stacked vertically for compact layout */}
                  <div className="space-y-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReleaseOrder(order.id);
                      }}
                      disabled={gameState.session.status !== "running"}
                      className="w-full flex items-center justify-center space-x-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                      <Play size={10} />
                      <span>Release</span>
                    </button>
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
              ))}
              {gameState.pendingOrders.length === 0 && (
                <div className="col-span-full text-gray-500 text-center py-8">
                  No incoming orders
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Manufacturing Departments */}
        <div className="xl:col-span-3">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Manufacturing Departments
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gameState.departments.map((dept) => {
              const priorityRule = departmentPriorityRules[dept.id];
              const sortedQueue = sortOrdersByPriorityRule(
                dept.queue,
                priorityRule
              );
              const capacityPercentage =
                (dept.wipCount / dept.maxQueueSize) * 100;

              return (
                <div
                  key={dept.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDropOnDepartment(dept.id);
                  }}
                  className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-300 min-h-[380px] ${
                    draggedOrder && draggedOrder.route.includes(dept.id)
                      ? "border-green-400 bg-green-50"
                      : draggedOrder
                      ? "border-gray-300 bg-gray-100"
                      : "border-gray-200"
                  } ${
                    capacityPercentage > 90 ? "border-red-300 bg-red-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {dept.name}
                      </h3>
                      <div className="text-xs text-gray-600 mt-1">
                        {dept.standardProcessingTime}min processing time
                      </div>
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
                  {dept.inProcess && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">
                          Processing: {dept.inProcess.id}
                        </span>
                        <span className="text-xs text-blue-700">
                          {formatTime(dept.inProcess.processingTimeRemaining)}
                        </span>
                      </div>
                      <div className="text-xs text-blue-700">
                        Priority: {dept.inProcess.priority}
                      </div>
                      <button
                        onClick={() => handleCompleteProcessing(dept.id)}
                        className="mt-2 w-full bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        Complete Processing
                      </button>
                    </div>
                  )}

                  {/* Queue Display */}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Queue ({sortedQueue.length} orders)
                    </div>
                    {sortedQueue.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {sortedQueue.map((order, index) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded border text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </span>
                              <span className="font-medium">{order.id}</span>
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
                              <div className="text-xs text-gray-600 mt-0.5">
                                {order.priority.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-4 text-xs">
                        No orders to process
                      </div>
                    )}
                  </div>
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
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Route
                </label>
                <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">
                  {selectedOrder.route.join(" → ")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Due Date
                </label>
                <p className="text-lg">
                  {selectedOrder.dueDate.toLocaleString()}
                </p>
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

import { useState } from "react";
import {
  Package,
  Factory,
  ShoppingCart,
  Play,
  Pause,
  RotateCcw,
  Eye,
  XCircle,
} from "lucide-react";
import type { Order, GameSettings } from "../types";
import {
  RandomEventsDisplay,
  UndoRedoControls,
  RouteOptimizer,
  CapacityPlanner,
} from "../components";
import { useGameSimulation } from "../hooks/useGameSimulation";
import { 
  sortOrdersByPriorityRule, 
  getPriorityRuleDescription, 
  getPriorityRuleInsights
} from "../utils/priorityRules";
import type { PriorityRule } from "../types";

export default function ManualGameScreen() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [departmentPriorityRules, setDepartmentPriorityRules] = useState<{[key: number]: PriorityRule}>({
    1: 'FIFO', // Welding
    2: 'FIFO', // Machining  
    3: 'FIFO', // Painting
    4: 'FIFO'  // Assembly
  });
  const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);
  const [showPriorityPanel, setShowPriorityPanel] = useState(false);

  // Game settings for Manual Game mode - focused on learning
  const gameSettings: GameSettings = {
    sessionDuration: 15, // Shorter sessions for manual learning
    gameSpeed: 1, // Normal speed for learning
    orderGenerationRate: "low", // Slower pace for manual processing
    complexityLevel: "beginner", // Start with beginner level
    enableEvents: true, // Keep events for learning scenarios
    enableAdvancedRouting: false, // Simplify for manual mode
    randomSeed: "manual-seed-123",
  };

  // Use the game simulation hook
  const {
    gameState,
    currentDecisionIndex,
    startGame,
    pauseGame,
    resetGame,
    releaseOrder,
    scheduleOrder,
    rebalanceWorkload,
    undoLastDecision,
    redoLastDecision,
    clearDecisionHistory,
  } = useGameSimulation(gameSettings);

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailDrawerOpen(true);
  };

  const handleReleaseOrder = (orderId: string) => {
    releaseOrder(orderId);
  };

  const handleAssignOrderToDepartment = (order: Order, departmentId: number) => {
    // Check if department has capacity
    const department = gameState.departments.find(d => d.id === departmentId);
    if (!department) return;

    // Check if this order's route includes this department
    if (!order.route.includes(departmentId)) {
      alert(`Order ${order.id} does not include ${department.name} in its route.`);
      return;
    }

    // Check capacity
    if (department.wipCount >= department.maxQueueSize) {
      alert(`${department.name} is at maximum capacity (${department.maxQueueSize} orders). Cannot assign more orders.`);
      return;
    }

    // For manual mode, allow students to assign pending orders directly to any department in their route
    console.log(`Manually assigning order ${order.id} to ${department.name}`);
    
    // This would typically be handled by a game action
    // For now, we'll simulate the assignment
    scheduleOrder(order.id, departmentId, new Date());
  };

  const handleChangePriorityRule = (departmentId: number, newRule: PriorityRule) => {
    setDepartmentPriorityRules(prev => ({
      ...prev,
      [departmentId]: newRule
    }));

    // Show educational feedback about the change
    const department = gameState.departments.find(d => d.id === departmentId);
    if (department) {
      const insights = getPriorityRuleInsights(newRule);
      console.log(`Changed ${department.name} to ${newRule}:`, insights.bestFor);
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

  const handleStartProcessing = (departmentId: number) => {
    const dept = gameState.departments.find(d => d.id === departmentId);
    if (!dept || dept.queue.length === 0 || dept.inProcess) return;

    const priorityRule = departmentPriorityRules[departmentId];
    const sortedQueue = sortOrdersByPriorityRule(dept.queue, priorityRule);
    const nextOrder = sortedQueue[0];
    
    if (nextOrder) {
      console.log(`Starting processing of order ${nextOrder.id} in ${dept.name} using ${priorityRule} rule`);
      // This would typically update the game state
      // For now we'll use the existing scheduleOrder function
      scheduleOrder(nextOrder.id, departmentId, new Date());
    }
  };

  const handleCompleteProcessing = (departmentId: number) => {
    const dept = gameState.departments.find(d => d.id === departmentId);
    if (!dept || !dept.inProcess) return;

    const processingOrder = dept.inProcess;
    console.log(`Manually completing processing of order ${processingOrder.id} in ${dept.name}`);

    // Find the next department in the order's route
    const currentStepIndex = processingOrder.currentStepIndex || 0;
    const nextStepIndex = currentStepIndex + 1;
    const isLastStep = nextStepIndex >= processingOrder.route.length;

    if (isLastStep) {
      // Order is fully completed
      console.log(`Order ${processingOrder.id} has completed all manufacturing steps`);
      alert(`Order ${processingOrder.id} has completed all manufacturing steps and will be moved to completed orders.`);
      
      // Note: The actual completion will be handled by the automatic game simulation
      // For now, we inform the user that the order is complete
    } else {
      // Move to next department
      const nextDeptId = processingOrder.route[nextStepIndex];
      const nextDept = gameState.departments.find(d => d.id === nextDeptId);
      
      if (nextDept) {
        console.log(`Moving order ${processingOrder.id} from ${dept.name} to ${nextDept.name}`);
        
        // Check if next department has capacity
        if (nextDept.wipCount >= nextDept.maxQueueSize) {
          alert(`Cannot move order to ${nextDept.name} - department is at maximum capacity (${nextDept.maxQueueSize} orders)`);
          return;
        }
        
        // Use scheduleOrder to move the order to the next department
        // This simulates completing processing and moving to next step
        scheduleOrder(processingOrder.id, nextDeptId, new Date());
        
        console.log(`Order ${processingOrder.id} moved to ${nextDept.name} for next processing step`);
      } else {
        console.error(`Next department ${nextDeptId} not found for order ${processingOrder.id}`);
      }
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
      {/* Header with Game Controls */}
      <div className="mb-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manual Game Mode</h1>
            <p className="text-gray-600 mt-2">
              Step-by-step manufacturing simulation for hands-on learning
            </p>
          </div>
          
          {/* Compact Game Controls for header */}
          <div className="flex items-center space-x-3">
            {/* Game Status Indicator */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                gameState.session.status === "running"
                  ? "bg-green-100 text-green-800"
                  : gameState.session.status === "paused"
                  ? "bg-yellow-100 text-yellow-800"
                  : gameState.session.status === "completed"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {gameState.session.status.charAt(0).toUpperCase() + gameState.session.status.slice(1)}
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center space-x-2">
              {gameState.session.status === "setup" && (
                <button
                  onClick={startGame}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Play size={16} />
                  <span>Start</span>
                </button>
              )}

              {gameState.session.status === "running" && (
                <button
                  onClick={pauseGame}
                  className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  <Pause size={16} />
                  <span>Pause</span>
                </button>
              )}

              {gameState.session.status === "paused" && (
                <button
                  onClick={startGame}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Play size={16} />
                  <span>Resume</span>
                </button>
              )}

              <button
                onClick={resetGame}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Rules Panel */}
      <div className="mb-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Department Priority Rules</h3>
          <button
            onClick={() => setShowPriorityPanel(!showPriorityPanel)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {showPriorityPanel ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {gameState.departments.map((dept) => (
            <div key={dept.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">{dept.name}</h4>
              <select
                value={departmentPriorityRules[dept.id]}
                onChange={(e) => handleChangePriorityRule(dept.id, e.target.value as PriorityRule)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="FIFO">FIFO</option>
                <option value="EDD">EDD</option>
                <option value="SPT">SPT</option>
              </select>
              <div className="text-xs text-gray-600 mt-1">
                WIP: {dept.wipCount}/{dept.maxQueueSize}
              </div>
            </div>
          ))}
        </div>

        {showPriorityPanel && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">Priority Rule Guide</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong className="text-blue-800">FIFO</strong>
                <p className="text-blue-700">{getPriorityRuleDescription('FIFO')}</p>
              </div>
              <div>
                <strong className="text-blue-800">EDD</strong>
                <p className="text-blue-700">{getPriorityRuleDescription('EDD')}</p>
              </div>
              <div>
                <strong className="text-blue-800">SPT</strong>
                <p className="text-blue-700">{getPriorityRuleDescription('SPT')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Random Events Display */}
      <RandomEventsDisplay
        events={gameState.gameEvents}
        onDismissEvent={(eventId) => {
          console.log("Dismissing event:", eventId);
        }}
      />

      {/* Undo/Redo Controls */}
      <div className="mb-6">
        <UndoRedoControls
          decisions={gameState.decisions}
          currentDecisionIndex={currentDecisionIndex}
          onUndo={undoLastDecision}
          onRedo={redoLastDecision}
          onClearHistory={clearDecisionHistory}
        />
      </div>

      {/* Order Management - Combined Sales and Incoming Orders */}
      <div className="mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
              <p className="text-sm font-medium text-blue-900">Quick Actions</p>
              <p className="text-xs text-blue-700">Approve and release customer orders for production</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // Release all orders that can fit in factory capacity
                  const availableCapacity = gameState.departments.reduce((total, dept) => 
                    total + (dept.maxQueueSize - dept.wipCount), 0);
                  const ordersToRelease = Math.min(gameState.pendingOrders.length, availableCapacity, 3);
                  for (let i = 0; i < ordersToRelease; i++) {
                    if (gameState.pendingOrders[i]) {
                      handleReleaseOrder(gameState.pendingOrders[i].id);
                    }
                  }
                }}
                disabled={
                  gameState.pendingOrders.length === 0 ||
                  gameState.session.status !== "running" ||
                  gameState.departments.every(dept => dept.wipCount >= dept.maxQueueSize)
                }
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
              >
                <Package size={16} />
                <span>Batch Release (Up to 3)</span>
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            <strong>Instructions:</strong> Each customer order needs to be <strong>released to production</strong> before manufacturing can begin. 
            Click "Release to Production" to approve an order and send it to the first department in its route. 
            Consider order priority, due dates, and department capacity when deciding which orders to release.
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {gameState.pendingOrders.slice(0, 8).map((order) => (
              <div
                key={order.id}
                draggable
                onDragStart={() => handleDragStart(order)}
                onDragEnd={handleDragEnd}
                className={`p-4 bg-gray-50 rounded-lg border transition-all duration-200 ${
                  draggedOrder?.id === order.id 
                    ? 'opacity-50 scale-95' 
                    : 'hover:bg-gray-100 cursor-grab active:cursor-grabbing'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-semibold text-gray-800">
                    {order.id}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full text-white font-medium ${getSLAStatusColor(
                      order
                    )}`}
                  >
                    {order.slaStatus?.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                      Route: {order.route.join("→")}
                    </span>
                    {order.isHalfOrder && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                        HALF
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    order.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    order.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    order.priority === 'normal' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.priority.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-gray-600 mb-3">
                  Due: {order.dueDate.toLocaleDateString()} {order.dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>

                {/* Quick Assignment Buttons */}
                <div className="flex flex-wrap gap-1">
                  {order.route.map((deptId) => {
                    const dept = gameState.departments.find(d => d.id === deptId);
                    const isAtCapacity = dept && dept.wipCount >= dept.maxQueueSize;
                    
                    return (
                      <button
                        key={deptId}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignOrderToDepartment(order, deptId);
                        }}
                        disabled={isAtCapacity}
                        className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                          isAtCapacity 
                            ? 'bg-red-100 text-red-400 cursor-not-allowed' 
                            : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                        }`}
                        title={isAtCapacity ? `${dept?.name} is at capacity` : `Assign to ${dept?.name}`}
                      >
                        {dept?.name}
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openOrderDetail(order);
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center"
                  >
                    <Eye size={14} className="inline mr-1" />
                    View Details
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReleaseOrder(order.id);
                    }}
                    disabled={gameState.session.status !== "running"}
                    className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    <Play size={12} />
                    <span>Release to Production</span>
                  </button>
                </div>
              </div>
            ))}
            {gameState.pendingOrders.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No incoming orders
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Factory Grid (2x2) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Manufacturing Departments
        </h2>
        <div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto">
          {gameState.departments.map((dept) => {
            const priorityRule = departmentPriorityRules[dept.id];
            const sortedQueue = sortOrdersByPriorityRule(dept.queue, priorityRule);
            const capacityPercentage = (dept.wipCount / dept.maxQueueSize) * 100;

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
                } ${capacityPercentage > 90 ? 'border-red-300 bg-red-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {dept.name}
                    </h3>
                    <div className="text-xs text-gray-600 mt-1">
                      {dept.standardProcessingTime}min | {priorityRule} rule
                    </div>
                  </div>
                  <Factory className="w-8 h-8 text-purple-600" />
                </div>

                {/* WIP Status Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      WIP Capacity
                    </span>
                    <span className="text-sm text-gray-600">
                      {dept.wipCount}/{dept.maxQueueSize}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        capacityPercentage > 90 ? 'bg-red-500' :
                        capacityPercentage > 70 ? 'bg-amber-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Queue</p>
                      <p className="text-lg font-bold text-gray-900">
                        {dept.queue.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Processing</p>
                      <p className="text-lg font-bold text-gray-900">
                        {dept.inProcess ? 1 : 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Utilization</p>
                      <p className="text-lg font-bold text-gray-900">
                        {dept.utilization}%
                      </p>
                    </div>
                  </div>

                  {/* Current Processing Order with Progress Bar */}
                  {dept.inProcess && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-blue-800 text-sm">
                          Processing: {dept.inProcess.id}
                        </span>
                        <span className="text-xs text-blue-600">
                          {formatTime(dept.inProcess.processingTimeRemaining)}
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000"
                          style={{
                            width: `${
                              dept.inProcess.processingTime &&
                              dept.inProcess.processingTimeRemaining
                                ? ((dept.inProcess.processingTime -
                                    dept.inProcess.processingTimeRemaining) /
                                    dept.inProcess.processingTime) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-blue-700 mt-1 flex items-center justify-between">
                        <span>Priority: {dept.inProcess.priority}</span>
                        {dept.inProcess.isHalfOrder && (
                          <span className="bg-purple-200 text-purple-800 px-1 py-0.5 rounded text-xs font-medium">
                            HALF ORDER
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Queue Orders - Sorted by Priority Rule */}
                  {sortedQueue.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700">
                          Queue ({priorityRule} order):
                        </p>
                        {sortedQueue.length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{sortedQueue.length - 4} more
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {sortedQueue.slice(0, 4).map((order, index) => (
                          <div
                            key={order.id}
                            className={`text-xs p-2 rounded flex justify-between items-center ${
                              index === 0 ? 'bg-green-100 border border-green-300' : 'bg-gray-100'
                            }`}
                          >
                            <div>
                              <span className="font-mono font-semibold">{order.id}</span>
                              {index === 0 && <span className="ml-2 text-green-700 font-medium">NEXT</span>}
                            </div>
                            <div className="text-right">
                              <div className={`text-xs px-1 py-0.5 rounded ${
                                order.priority === 'urgent' ? 'bg-red-200 text-red-800' :
                                order.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                                order.priority === 'normal' ? 'bg-blue-200 text-blue-800' :
                                'bg-gray-200 text-gray-800'
                              }`}>
                                {order.priority}
                              </div>
                              {priorityRule === 'EDD' && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  Due: {order.dueDate.toLocaleDateString()}
                                </div>
                              )}
                              {priorityRule === 'SPT' && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {order.processingTime || dept.standardProcessingTime}min
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drop Zone Indicator */}
                  {draggedOrder && draggedOrder.route.includes(dept.id) && (
                    <div className="border-2 border-dashed border-green-400 rounded-lg p-4 text-center bg-green-50">
                      <div className="text-sm font-medium text-green-800">
                        Drop order here
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {dept.wipCount < dept.maxQueueSize 
                          ? `Available capacity: ${dept.maxQueueSize - dept.wipCount}` 
                          : 'At maximum capacity!'
                        }
                      </div>
                    </div>
                  )}

                  {/* Manual Processing Controls */}
                  <div className="mt-4 space-y-2">
                    {!dept.inProcess && sortedQueue.length > 0 && (
                      <button
                        onClick={() => handleStartProcessing(dept.id)}
                        disabled={gameState.session.status !== "running"}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
                      >
                        Start Processing Next Order
                      </button>
                    )}

                    {dept.inProcess && (
                      <button
                        onClick={() => handleCompleteProcessing(dept.id)}
                        disabled={gameState.session.status !== "running"}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
                      >
                        Complete Processing
                      </button>
                    )}

                    {sortedQueue.length === 0 && !dept.inProcess && (
                      <div className="text-center text-gray-500 text-sm py-2">
                        No orders to process
                      </div>
                    )}
                  </div>

                  {/* No capacity warning */}
                  {capacityPercentage >= 100 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center mt-2">
                      <div className="text-sm font-medium text-red-800">
                        Department at Maximum Capacity
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        Cannot accept more orders
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Order Management - Simplified for Manual Game Mode */}
      <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Order Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Orders */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-3">
              Pending Orders ({gameState.pendingOrders.length})
            </h4>
            <div className="space-y-2">
              {gameState.pendingOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm font-semibold">
                      {order.id}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {order.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Due: {order.dueDate.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Orders */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-3">
              Active Orders ({gameState.departments.reduce((count, dept) =>
                count + dept.queue.length + (dept.inProcess ? 1 : 0), 0)})
            </h4>
            <div className="space-y-2">
              {gameState.departments.flatMap(dept => [
                ...dept.queue.slice(0, 2),
                ...(dept.inProcess ? [dept.inProcess] : [])
              ]).slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm font-semibold">
                      {order.id}
                    </span>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      PROCESSING
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Dept: {order.currentDepartment || "N/A"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Orders */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-3">
              Completed Orders ({gameState.completedOrders.length})
            </h4>
            <div className="space-y-2">
              {gameState.completedOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm font-semibold">
                      {order.id}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {order.status === "completed-on-time" ? "ON TIME" : "LATE"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Lead Time: {order.actualLeadTime || 0}min
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
          onScheduleOrder={(orderId, departmentId, scheduledTime) => {
            scheduleOrder(orderId, departmentId, scheduledTime);
          }}
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
                Order Details: {selectedOrder.id}
              </h3>
              <button
                onClick={() => setDetailDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <XCircle size={28} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
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
                  <h4 className="font-semibold text-purple-900 mb-2">Half Order Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-purple-800 block">Reason:</label>
                      <p className="text-purple-700">
                        {selectedOrder.halfOrderReason?.replace('_', ' ').toUpperCase() || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="font-medium text-purple-800 block">Processing Time:</label>
                      <p className="text-purple-700">
                        {Math.round((selectedOrder.processingTimeMultiplier || 1) * 100)}% of normal
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="font-medium text-purple-800 block">Special Instructions:</label>
                    <p className="text-purple-700">{selectedOrder.specialInstructions || 'None'}</p>
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
                          <span className="font-medium">
                            Department {timestamp.deptId}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          <div>
                            Start: {timestamp.start.toLocaleTimeString()}
                          </div>
                          {timestamp.end && (
                            <div>End: {timestamp.end.toLocaleTimeString()}</div>
                          )}
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
        </div>
      )}
    </div>
  );
}

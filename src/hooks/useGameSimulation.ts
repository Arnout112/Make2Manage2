import { useState, useEffect, useCallback, useRef } from "react";
import type {
  GameState,
  GameSettings,
  Order,
  Department,
  GameEvent,
  Decision,
} from "../types";
import {
  initializeGameState,
  SeededRandom,
  generateRandomRoute,
} from "../utils/gameInitialization";

export const useGameSimulation = (initialSettings: GameSettings) => {
  const [gameState, setGameState] = useState<GameState>(() =>
    initializeGameState(initialSettings)
  );
  const [isRunning, setIsRunning] = useState(false);
  // Simulation speed multiplier (1 = real-time, 2 = 2x, etc.)
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(-1); // R13: Track decision position
  const intervalRef = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());
  const rngRef = useRef(new SeededRandom(initialSettings.randomSeed));

  // Re-initialize simulation when provided settings change (e.g., loading a level)
  // Use a JSON-stable key so shallow prop object identity changes don't force re-init.
  const _settingsKey = JSON.stringify(initialSettings || {});
  useEffect(() => {
    // Stop simulation and reset state using the new settings
    setIsRunning(false);
    rngRef.current = new SeededRandom(initialSettings.randomSeed);
    lastUpdateTime.current = Date.now();
    setSimulationSpeed(initialSettings.gameSpeed || 1);
    setGameState(initializeGameState(initialSettings));
  }, [_settingsKey]);

  // Calculate processing time for an order at a department
  const calculateProcessingTime = useCallback(
    (order: Order, department: Department): number => {
      // Use standard processing time as base (stored in milliseconds)
      const baseTime = department.standardProcessingTime;
      const efficiencyFactor = department.efficiency;
      const equipmentFactor = department.equipmentCondition;
      const complexityFactor =
        order.route.length > 5 ? 1.2 : order.route.length < 3 ? 0.8 : 1.0;

      // Apply half order multiplier if present
      const halfOrderMultiplier = order.processingTimeMultiplier || 1.0;

      return Math.floor(
        baseTime *
          efficiencyFactor *
          equipmentFactor *
          complexityFactor *
          halfOrderMultiplier
      );
    },
    []
  );

  // Generate new orders based on time and settings
  // elapsedMs: logical game-time elapsed since last tick (already scaled by simulationSpeed)
  const generateNewOrders = useCallback((elapsedMs: number): Order[] => {
    const rng = rngRef.current;
    const { orderGenerationRate, complexityLevel } = gameState.session.settings;

    // Calculate generation probability based on rate and time
    let generationChance = 0;
    switch (orderGenerationRate) {
      case "low":
        generationChance = 0.002; // ~7 orders per hour
        break;
      case "medium":
        generationChance = 0.006; // ~22 orders per hour (increased for more FIFO decisions)
        break;
      case "high":
        generationChance = 0.009; // ~32 orders per hour (increased for challenging priority decisions)
        break;
    }

  const newOrders: Order[] = [];
  // Treat generationChance as per-second probability; scale by elapsedMs
  const perTickChance = Math.min(1, generationChance * (elapsedMs / 1000));
  if (rng.next() < perTickChance) {
      // Determine if this order should include Engineering (25% chance)
      const includeEngineering = rng.next() < 0.25;

      // Generate route - always use generateRandomRoute to ensure Engineering-first rule
      const route = generateRandomRoute(
        rng,
        complexityLevel,
        includeEngineering
      );

      const orderId = `ORD-${String(
        gameState.totalOrdersGenerated + 1
      ).padStart(3, "0")}`;

      // Select a random customer for this order
      const randomCustomer =
        gameState.customers[rng.between(0, gameState.customers.length - 1)];

      // Generate order value based on complexity and customer tier
      const baseValue = route.length * 150; // Base value per step
      const tierMultiplier =
        randomCustomer.tier === "vip"
          ? 1.5
          : randomCustomer.tier === "premium"
          ? 1.3
          : 1.0;
      const orderValue = Math.round(
        baseValue * tierMultiplier * rng.between(0.8, 1.4)
      );

      // Determine priority based on customer tier and random factors
      let priority: "low" | "normal" | "high" | "urgent";
      if (randomCustomer.tier === "vip") {
        priority = rng.between(0, 100) < 40 ? "urgent" : "high";
      } else if (randomCustomer.tier === "premium") {
        priority = rng.between(0, 100) < 30 ? "high" : "normal";
      } else {
        priority = rng.between(0, 100) < 10 ? "high" : "normal";
      }

      // Check for rush order and half order
      const isRushOrder =
        rng.between(0, 100) < (randomCustomer.tier === "vip" ? 15 : 5);
      const isHalfOrder = rng.next() < 0.2; // 20% chance for new orders
      const halfOrderReasons = [
        "defect_repair",
        "partial_work",
        "rework",
        "quality_issue",
      ];
      const halfOrderReason = isHalfOrder
        ? (halfOrderReasons[
            Math.floor(rng.next() * halfOrderReasons.length)
          ] as "defect_repair" | "partial_work" | "rework" | "quality_issue")
        : undefined;
      const processingTimeMultiplier = isHalfOrder
        ? rng.between(0.3, 0.7)
        : 1.0;

      // Adjust order value for half orders
      const adjustedOrderValue = Math.round(
        orderValue * (isHalfOrder ? 0.6 : 1.0)
      );

      // Determine in-game due time (minutes) based on priority level
      // Priority-based due times: Lower priority = more time to complete
      const priorityDueTimes = {
        urgent: 4,   // 4 minutes from when order appears
        high: 6,     // 6 minutes from when order appears  
        normal: 8,   // 8 minutes from when order appears
        low: 10,     // 10 minutes from when order appears
      };
      
      const extraDue = priorityDueTimes[priority];
      const capMinutes = gameState.session.settings.sessionDuration || 30;
      const currentElapsedMinutes = Math.floor(
        gameState.session.elapsedTime / 60000
      );
      const dueGameMinutes = Math.min(
        capMinutes,
        currentElapsedMinutes + extraDue
      );

      newOrders.push({
        id: orderId,
        customerId: randomCustomer.id,
        customerName: randomCustomer.name,
        priority,
        orderValue: adjustedOrderValue,
        specialInstructions:
          isHalfOrder && halfOrderReason
            ? `Half Order: ${halfOrderReason.replace("_", " ").toUpperCase()}`
            : isRushOrder
            ? "RUSH ORDER - Expedited processing required"
            : "",
        rushOrder: isRushOrder,
        isHalfOrder,
        halfOrderReason,
        processingTimeMultiplier,
        dueGameMinutes,
        route,
        currentStepIndex: -1,
        status: "queued",
        timestamps: [],
        reworkCount: 0,
        createdAt: new Date(),
        slaStatus: "on-track",
      });
    }

    return newOrders;
  }, [gameState.totalOrdersGenerated, gameState.session.settings]);

  // Update SLA status for orders
  const updateSLAStatus = useCallback(
    (order: Order): Order => {
      // Use game-time aware 'now' so SLA reacts to simulationSpeed
      const sessionStart = gameState.sessionLog?.startTime
        ? gameState.sessionLog.startTime.getTime()
        : Date.now();
      const now = sessionStart + gameState.session.elapsedTime;

      // Compute absolute due time: prefer dueGameMinutes (relative to session start) else fallback to legacy dueDate
      const dueAbsoluteMs =
        order.dueGameMinutes !== undefined
          ? sessionStart + order.dueGameMinutes * 60 * 1000
          : order.dueDate
          ? order.dueDate.getTime()
          : order.createdAt.getTime() + 30 * 60 * 1000; // fallback 30 minutes

      const timeLeft = dueAbsoluteMs - now;
      const totalTime = dueAbsoluteMs - order.createdAt.getTime();
      const elapsed = now - order.createdAt.getTime();
      const progress = totalTime > 0 ? elapsed / totalTime : 1;

      let slaStatus: "on-track" | "at-risk" | "overdue";
      if (timeLeft < 0) {
        slaStatus = "overdue";
      } else if (progress > 0.8) {
        slaStatus = "at-risk";
      } else {
        slaStatus = "on-track";
      }

      return { ...order, slaStatus };
    },
    [gameState.sessionLog]
  );

  // R07: Generate random events (equipment failures, rush orders, etc.)
  const generateRandomEvents = useCallback(
    (departments: Department[], elapsedMs: number): GameEvent[] => {
      if (!gameState.session.settings.enableEvents) return [];

      const events: GameEvent[] = [];
      const rng = rngRef.current;

  // Equipment failure event (0.1% chance per second)
  const equipmentFailurePerSec = 0.001;
  if (rng.next() < Math.min(1, equipmentFailurePerSec * (elapsedMs / 1000))) {
        const affectedDept = rng.choice(
          departments.filter((d) => d.status !== "maintenance")
        );
        if (affectedDept) {
          events.push({
            id: `event-${Date.now()}-${Math.random()}`,
            type: "equipment-failure",
            timestamp: new Date(),
            message: `Equipment failure in ${affectedDept.name}! Processing slowed by 50%`,
            severity: "error",
            departmentId: affectedDept.id,
          });
        }
      }

      // Rush order event (0.05% chance per second)
      const rushOrderPerSec = 0.0005;
      if (rng.next() < Math.min(1, rushOrderPerSec * (elapsedMs / 1000))) {
        events.push({
          id: `event-${Date.now()}-${Math.random()}`,
          type: "rush-order",
          timestamp: new Date(),
          message: `Rush order received! Tight deadline requires priority handling`,
          severity: "warning",
        });
      }

      // Delivery delay event (0.02% chance per second)
      const deliveryDelayPerSec = 0.0002;
      if (rng.next() < Math.min(1, deliveryDelayPerSec * (elapsedMs / 1000))) {
        events.push({
          id: `event-${Date.now()}-${Math.random()}`,
          type: "delivery-delay",
          timestamp: new Date(),
          message: `Material delivery delayed. Some departments may experience shortages`,
          severity: "warning",
        });
      }

      // Efficiency boost event (0.03% chance per second)
      const efficiencyBoostPerSec = 0.0003;
      if (rng.next() < Math.min(1, efficiencyBoostPerSec * (elapsedMs / 1000))) {
        const boostedDept = rng.choice(departments);
        events.push({
          id: `event-${Date.now()}-${Math.random()}`,
          type: "efficiency-boost",
          timestamp: new Date(),
          message: `${boostedDept.name} running at peak efficiency! 25% speed boost`,
          severity: "success",
          departmentId: boostedDept.id,
        });
      }

      return events;
    },
    [gameState.session.settings.enableEvents]
  );

  // Manual mode department updates - only update timers and status, no auto-processing
  const processManualDepartmentUpdates = useCallback(
    (
      departments: Department[],
      elapsedMs: number
    ): {
      updatedDepartments: Department[];
      completedOrders: Order[];
      events: GameEvent[];
    } => {
      const updatedDepartments: Department[] = [];
      const events: GameEvent[] = [];

      departments.forEach((dept) => {
        const updatedDept = { ...dept, queue: [...dept.queue] };

        // Only update processing time countdown if student started processing
        if (updatedDept.inProcess) {
          const order = updatedDept.inProcess;
          const timeRemaining = Math.max(
            0,
            (order.processingTimeRemaining || 0) - elapsedMs
          );

          updatedDept.inProcess = {
            ...order,
            processingTimeRemaining: timeRemaining,
          };

          // Visual indicator when processing is complete (but don't auto-complete)
          if (timeRemaining <= 0) {
            events.push({
              id: `event-${Date.now()}-${Math.random()}`,
              type: "processing-ready",
              timestamp: new Date(),
              message: `⏰ Order ${order.id} processing complete in ${dept.name}! Click 'Complete Processing' to continue.`,
              severity: "info",
              orderId: order.id,
              departmentId: dept.id,
            });
          }
        }

        // Update department status based on manual activity
        if (updatedDept.inProcess) {
          updatedDept.status = "busy";
        } else if (updatedDept.queue.length > 0) {
          updatedDept.status = "available";
        } else {
          updatedDept.status = "available";
        }

        // Calculate utilization based on current state (for educational feedback)
        updatedDept.utilization = updatedDept.inProcess ? 100 : 0;

        updatedDepartments.push(updatedDept);
      });

      return { updatedDepartments, completedOrders: [], events };
    },
    []
  );

  // Process department operations
  const processDepartmentUpdates = useCallback(
    (
      departments: Department[],
      elapsedMs: number
    ): {
      updatedDepartments: Department[];
      completedOrders: Order[];
      events: GameEvent[];
    } => {
      const updatedDepartments: Department[] = [];
      const completedOrders: Order[] = [];
      const events: GameEvent[] = [];

      departments.forEach((dept) => {
        const updatedDept = { ...dept, queue: [...dept.queue] };

        // Process currently active order
        if (updatedDept.inProcess) {
          const order = updatedDept.inProcess;
          const timeRemaining = (order.processingTimeRemaining || 0) - elapsedMs;

          if (timeRemaining <= 0) {
            // Current operation completed
            const currentOpIndex = order.currentOperationIndex || 0;
            const currentOperation = updatedDept.operations[currentOpIndex];

            // Mark current operation as completed
            if (order.operationProgress) {
              const progressIndex = order.operationProgress.findIndex(
                (p) => p.operationId === currentOperation.id
              );
              if (progressIndex >= 0) {
                order.operationProgress[progressIndex].completed = true;
                order.operationProgress[progressIndex].endTime = new Date();
              }
            }

            // Check if there are more operations in this department
            const nextOpIndex = currentOpIndex + 1;
            if (nextOpIndex < updatedDept.operations.length) {
              // Start next operation in same department
              const nextOperation = updatedDept.operations[nextOpIndex];
              const nextOpTime = nextOperation.duration; // duration stored in ms

              updatedDept.inProcess = {
                ...order,
                currentOperationIndex: nextOpIndex,
                processingTime: nextOpTime,
                processingTimeRemaining: nextOpTime,
                operationProgress: [
                  ...(order.operationProgress || []),
                  {
                    operationId: nextOperation.id,
                    operationName: nextOperation.name,
                    startTime: new Date(),
                    duration: nextOperation.duration,
                    completed: false,
                  },
                ],
              };
            } else {
              // All operations in this department completed
              const completedOrder = { ...order, processingTimeRemaining: 0 };

              // Add completion timestamp for this department
              const lastTimestamp =
                completedOrder.timestamps[completedOrder.timestamps.length - 1];
              if (lastTimestamp && !lastTimestamp.end) {
                lastTimestamp.end = new Date();
              }

              // Move to next department or complete order
              const nextStepIndex = completedOrder.currentStepIndex + 1;
              if (nextStepIndex >= completedOrder.route.length) {
                // Order fully completed - ensure all timestamps are present
                const now = new Date();
                
                // Create missing timestamps for any departments not yet timestamped
                const timestampedDeptIds = new Set(completedOrder.timestamps.map(t => t.deptId));
                completedOrder.route.forEach(deptId => {
                  if (!timestampedDeptIds.has(deptId)) {
                    // Add missing timestamp with both start and end
                    completedOrder.timestamps.push({
                      deptId,
                      start: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
                      end: now
                    });
                  }
                });
                
                // Ensure all timestamps have end times
                completedOrder.timestamps.forEach(timestamp => {
                  if (!timestamp.end) {
                    timestamp.end = now;
                  }
                });
                
                // Update SLA status one final time before completion to ensure accuracy
                // Note: The order already has updated SLA status from the department processing above
                
                completedOrder.status =
                  completedOrder.slaStatus === "overdue"
                    ? "completed-late"
                    : "completed-on-time";
                completedOrder.completedAt = now;
                completedOrder.actualLeadTime = Math.floor(
                  (now.getTime() - completedOrder.createdAt.getTime()) /
                    (60 * 1000)
                );
                completedOrders.push(completedOrder);

                events.push({
                  id: `event-${Date.now()}-${Math.random()}`,
                  type: "order-completed",
                  timestamp: new Date(),
                  message: `Order ${completedOrder.id} completed ${
                    completedOrder.status === "completed-on-time"
                      ? "on time"
                      : "late"
                  }`,
                  severity:
                    completedOrder.status === "completed-on-time"
                      ? "success"
                      : "warning",
                  orderId: completedOrder.id,
                  departmentId: dept.id,
                });
              } else {
                // Move to next department
                const nextDeptId = completedOrder.route[nextStepIndex];
                const nextDept = departments.find((d) => d.id === nextDeptId);

                if (nextDept) {
                  completedOrder.currentStepIndex = nextStepIndex;
                  completedOrder.currentDepartment = nextDeptId;
                  completedOrder.status = "queued";
                  completedOrder.processingTime = calculateProcessingTime(
                    completedOrder,
                    nextDept
                  );
                  completedOrder.currentOperationIndex = 0; // Reset for next department
                  completedOrder.operationProgress = []; // Reset operation progress

                  // Add to next department's queue
                  const targetDept = updatedDepartments.find(
                    (d) => d.id === nextDeptId
                  ) || {
                    ...departments.find((d) => d.id === nextDeptId)!,
                    queue: [],
                  };
                  targetDept.queue.push(completedOrder);

                  if (!updatedDepartments.find((d) => d.id === nextDeptId)) {
                    updatedDepartments.push(targetDept);
                  }
                }
              }

              updatedDept.inProcess = undefined;
              updatedDept.totalProcessed += 1;
            }
          } else {
            // Continue processing current operation
            updatedDept.inProcess = {
              ...order,
              processingTimeRemaining: timeRemaining,
            };
          }
        }

        // Start processing next order in queue if department is available
        if (!updatedDept.inProcess && updatedDept.queue.length > 0) {
          const nextOrder = updatedDept.queue.shift()!;
          const firstOperation = updatedDept.operations[0];
          const processingTime = firstOperation.duration; // duration stored in ms

          updatedDept.inProcess = {
            ...nextOrder,
            status: "processing",
            processingTime,
            processingTimeRemaining: processingTime,
            currentOperationIndex: 0,
            operationProgress: [
              {
                operationId: firstOperation.id,
                operationName: firstOperation.name,
                startTime: new Date(),
                duration: firstOperation.duration,
                completed: false,
              },
            ],
            timestamps: [
              ...nextOrder.timestamps,
              { deptId: dept.id, start: new Date() },
            ],
          };
        }

        // Update utilization
        const queueLoad = updatedDept.queue.length;
        const processingLoad = updatedDept.inProcess ? 1 : 0;
        updatedDept.utilization = Math.min(
          100,
          (queueLoad + processingLoad) * 25
        );

        // Update status
        if (updatedDept.utilization > 85) {
          updatedDept.status = "overloaded";
        } else if (updatedDept.utilization > 50) {
          updatedDept.status = "busy";
        } else {
          updatedDept.status = "available";
        }

        if (!updatedDepartments.find((d) => d.id === dept.id)) {
          updatedDepartments.push(updatedDept);
        }
      });

      return { updatedDepartments, completedOrders, events };
    },
    [calculateProcessingTime]
  );

  // Main simulation step
  const simulationStep = useCallback(() => {
    const now = Date.now();
    const deltaTime = now - lastUpdateTime.current;
    lastUpdateTime.current = now;
    // Scale logical time by simulationSpeed so everything (elapsed time, processing, generation)
    // advances by simulationSpeed times real time.
    const effectiveDelta = Math.floor(deltaTime * simulationSpeed);

    setGameState((prevState) => {
      // Check if game should end
      if (prevState.session.elapsedTime >= prevState.session.duration) {
        return {
          ...prevState,
          session: {
            ...prevState.session,
            status: "completed",
            endTime: new Date(),
          },
        };
      }

  // Update elapsed time (game-time scaled)
  const newElapsedTime = prevState.session.elapsedTime + effectiveDelta;

      // Release scheduled orders to pendingOrders when their time arrives
      // (but don't auto-start them - students must drag them to departments)
      const orderReleaseEvents: GameEvent[] = [];
      const releasedOrders: Order[] = [];
      const remainingScheduledOrders = prevState.scheduledOrders.filter(
        (scheduledOrder) => {
          if (scheduledOrder.releaseTime <= newElapsedTime) {
            // Update createdAt to current game time for proper FIFO ordering
            const releasedOrder = {
              ...scheduledOrder.order,
              createdAt: new Date(),
            };
            releasedOrders.push(releasedOrder);
            orderReleaseEvents.push({
              id: `event-${Date.now()}-${Math.random()}`,
              type: "order-generated",
              timestamp: new Date(),
              message: `New order received: ${scheduledOrder.order.id}`,
              severity: "info",
              orderId: scheduledOrder.order.id,
            });
            return false; // Remove from scheduled
          }
          return true; // Keep in scheduled
        }
      );

  // Generate new orders unless we're using a predetermined level (then skip runtime generation)
  let newOrders: Order[] = [];
  if (!prevState.session.settings.usePredeterminedOrders) {
    newOrders = generateNewOrders(effectiveDelta);
  }

      // Update SLA status for all orders in the system (pending, queued, and processing)
      const updatedPendingOrders = [
        ...prevState.pendingOrders,
        ...releasedOrders,
      ].map(updateSLAStatus);

      // Also update SLA status for orders in department queues and processing
      const updatedDepartments = prevState.departments.map(dept => ({
        ...dept,
        queue: dept.queue.map(updateSLAStatus),
        inProcess: dept.inProcess ? updateSLAStatus(dept.inProcess) : undefined,
      }));

      // Process department updates - only automatic processing if NOT in manual mode
      const { updatedDepartments: finalDepartments, completedOrders, events } = prevState.session
        .settings.manualMode
        ? processManualDepartmentUpdates(updatedDepartments, effectiveDelta) // Manual mode: only timers and visual feedback
        : processDepartmentUpdates(updatedDepartments, effectiveDelta); // Automatic mode: normal processing

      // R07: Generate random events
  const randomEvents = generateRandomEvents(updatedDepartments, effectiveDelta);
      const allEvents = [...events, ...randomEvents, ...orderReleaseEvents];

      // Update performance metrics
      const totalCompleted =
        prevState.completedOrders.length + completedOrders.length;
      const onTimeCompleted = [
        ...prevState.completedOrders,
        ...completedOrders,
      ].filter((order) => order.status === "completed-on-time").length;

      const onTimeDeliveryRate =
        totalCompleted > 0 ? (onTimeCompleted / totalCompleted) * 100 : 0;
      const averageLeadTime =
        totalCompleted > 0
          ? [...prevState.completedOrders, ...completedOrders].reduce(
              (sum, order) => sum + (order.actualLeadTime || 0),
              0
            ) / totalCompleted
          : 0;

      const utilizationRates = finalDepartments.reduce((acc, dept) => {
        acc[dept.id] = dept.utilization;
        return acc;
      }, {} as { [key: number]: number });

      const bottleneckDepartment = finalDepartments.reduce(
        (max, dept) =>
          dept.utilization >
          (finalDepartments.find((d) => d.id === max)?.utilization || 0)
            ? dept.id
            : max,
        1
      );

      return {
        ...prevState,
        session: {
          ...prevState.session,
          elapsedTime: newElapsedTime,
        },
        departments: finalDepartments,
        pendingOrders: [...updatedPendingOrders, ...newOrders],
        // Scheduled orders are moved to pendingOrders when their releaseTime arrives
        scheduledOrders: remainingScheduledOrders,
        completedOrders: [...prevState.completedOrders, ...completedOrders],
        totalOrdersGenerated: prevState.totalOrdersGenerated + newOrders.length,
        gameEvents: [...prevState.gameEvents, ...allEvents].slice(-50), // Keep last 50 events
        performance: {
          onTimeDeliveryRate,
          averageLeadTime,
          totalThroughput: totalCompleted,
          utilizationRates,
          bottleneckDepartment,
        },
      };
    });
  }, [
    generateNewOrders,
    updateSLAStatus,
    processDepartmentUpdates,
    processManualDepartmentUpdates,
    generateRandomEvents,
    simulationSpeed,
  ]);

  // Start simulation
  const startGame = useCallback(() => {
    if (gameState.session.status === "setup") {
      setGameState((prev) => ({
        ...prev,
        session: { ...prev.session, status: "running", startTime: new Date() },
      }));
    } else if (gameState.session.status === "paused") {
      setGameState((prev) => ({
        ...prev,
        session: { ...prev.session, status: "running" },
      }));
    }
    setIsRunning(true);
  }, [gameState.session.status]);

  // Pause simulation
  const pauseGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      session: { ...prev.session, status: "paused" },
    }));
    setIsRunning(false);
  }, []);

  // Reset simulation
  const resetGame = useCallback(() => {
    setIsRunning(false);
    setGameState(initializeGameState(initialSettings));
    rngRef.current = new SeededRandom(initialSettings.randomSeed);
  }, [initialSettings]);

  // R13: Record decisions for undo/redo
  const recordDecision = useCallback(
    (
      type:
        | "order-release"
        | "game-pause"
        | "game-resume"
        | "settings-change"
        | "order-hold"
        | "order-resume",
      description: string,
      orderId?: string,
      previousState?: Partial<GameState>,
      newState?: Partial<GameState>
    ) => {
      const decision: Decision = {
        id: `decision-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        type,
        description,
        orderId,
        previousState,
        newState,
        canUndo: true,
      };

      setGameState((prev) => ({
        ...prev,
        decisions: [
          ...prev.decisions.slice(0, currentDecisionIndex + 1),
          decision,
        ],
      }));

      setCurrentDecisionIndex((prev) => prev + 1);
    },
    [currentDecisionIndex]
  );


  // Effect to handle simulation loop
  useEffect(() => {
    if (isRunning && gameState.session.status === "running") {
      // interval depends on simulationSpeed (faster speeds reduce interval)
      const intervalMs = Math.max(50, Math.floor(1000 / Math.max(1, simulationSpeed)));
      intervalRef.current = setInterval(simulationStep, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, gameState.session.status, simulationStep, simulationSpeed]);

  // Auto-pause when game completes
  useEffect(() => {
    if (gameState.session.status === "completed") {
      setIsRunning(false);
    }
  }, [gameState.session.status]);

  // R13: Undo/redo functionality
  const undoLastDecision = useCallback(() => {
    if (currentDecisionIndex >= 0 && gameState.decisions.length > 0) {
      const decision = gameState.decisions[currentDecisionIndex];
      if (decision.canUndo && decision.previousState) {
        setGameState((prev) => ({
          ...prev,
          ...decision.previousState,
        }));
        setCurrentDecisionIndex((prev) => prev - 1);
      }
    }
  }, [currentDecisionIndex, gameState.decisions]);

  const redoLastDecision = useCallback(() => {
    if (currentDecisionIndex < gameState.decisions.length - 1) {
      const nextDecision = gameState.decisions[currentDecisionIndex + 1];
      if (nextDecision.newState) {
        setGameState((prev) => ({
          ...prev,
          ...nextDecision.newState,
        }));
        setCurrentDecisionIndex((prev) => prev + 1);
      }
    }
  }, [currentDecisionIndex, gameState.decisions]);

  const clearDecisionHistory = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      decisions: [],
    }));
    setCurrentDecisionIndex(-1);
  }, []);

  // R06: Route optimization functionality
  const optimizeOrderRoute = useCallback(
    (orderId: string, newRoute: number[]) => {
      const previousState = { ...gameState };
      let newState: GameState;

      setGameState((prev) => {
        const pendingIndex = prev.pendingOrders.findIndex(
          (o) => o.id === orderId
        );
        if (pendingIndex !== -1) {
          const updatedPendingOrders = [...prev.pendingOrders];
          updatedPendingOrders[pendingIndex] = {
            ...updatedPendingOrders[pendingIndex],
            route: newRoute,
          };
          newState = {
            ...prev,
            pendingOrders: updatedPendingOrders,
          };
          return newState;
        }

        // Check if order is already in processing
        const updatedDepartments = prev.departments.map((dept) => {
          const queueIndex = dept.queue.findIndex((o) => o.id === orderId);
          if (queueIndex !== -1) {
            const updatedQueue = [...dept.queue];
            updatedQueue[queueIndex] = {
              ...updatedQueue[queueIndex],
              route: newRoute,
            };
            return { ...dept, queue: updatedQueue };
          }

          if (dept.inProcess?.id === orderId) {
            return {
              ...dept,
              inProcess: {
                ...dept.inProcess,
                route: newRoute,
              },
            };
          }

          return dept;
        });

        newState = {
          ...prev,
          departments: updatedDepartments,
        };
        return newState;
      });

      // Record the optimization decision
      recordDecision(
        "order-release",
        `Optimized route for order ${orderId}: ${newRoute.join(" → ")}`,
        orderId,
        previousState,
        newState!
      );
    },
    [gameState, recordDecision]
  );

  // R04-R05: Advanced scheduling functionality
  const scheduleOrder = useCallback(
    (orderId: string, departmentId: number, scheduledTime: Date) => {
      const previousState = { ...gameState };
      let newState: GameState;

      setGameState((prev) => {
        // Find the order in pending orders
        const orderIndex = prev.pendingOrders.findIndex(
          (o) => o.id === orderId
        );
        if (orderIndex === -1) return prev;

        const order = prev.pendingOrders[orderIndex];
        const updatedOrder = {
          ...order,
          currentStepIndex: 0,
          currentDepartment: departmentId,
          status: "queued" as const,
          // Add scheduling metadata (could be used for future scheduling logic)
          scheduledStartTime: scheduledTime,
        };

        // Remove from pending and add to target department
        const updatedPendingOrders = prev.pendingOrders.filter(
          (_, i) => i !== orderIndex
        );
        const updatedDepartments = prev.departments.map((dept) => {
          if (dept.id === departmentId) {
            return {
              ...dept,
              queue: [...dept.queue, updatedOrder],
            };
          }
          return dept;
        });

        newState = {
          ...prev,
          pendingOrders: updatedPendingOrders,
          departments: updatedDepartments,
        };
        return newState;
      });

      recordDecision(
        "order-release",
        `Scheduled order ${orderId} to Department ${departmentId} at ${scheduledTime.toLocaleTimeString()}`,
        orderId,
        previousState,
        newState!
      );
    },
    [gameState, recordDecision]
  );

  // R04-R05: Workload rebalancing functionality
  const rebalanceWorkload = useCallback(
    (sourceIds: number[], targetIds: number[], ordersToMove: string[]) => {
      const previousState = { ...gameState };
      let newState: GameState;

      setGameState((prev) => {
        const updatedDepartments = prev.departments.map((dept) => {
          // Remove orders from overloaded departments
          if (sourceIds.includes(dept.id)) {
            const remainingQueue = dept.queue.filter(
              (order) => !ordersToMove.includes(order.id)
            );
            return { ...dept, queue: remainingQueue };
          }
          return dept;
        });

        // Distribute moved orders to target departments
        const movedOrders: any[] = [];
        prev.departments.forEach((dept) => {
          if (sourceIds.includes(dept.id)) {
            const ordersFromThisDept = dept.queue.filter((order) =>
              ordersToMove.includes(order.id)
            );
            movedOrders.push(...ordersFromThisDept);
          }
        });

        // Distribute moved orders evenly across target departments
        const finalDepartments = updatedDepartments.map((dept) => {
          if (targetIds.includes(dept.id)) {
            const targetIndex = targetIds.indexOf(dept.id);
            const ordersForThisDept = movedOrders.filter(
              (_, index) => index % targetIds.length === targetIndex
            );
            return {
              ...dept,
              queue: [...dept.queue, ...ordersForThisDept],
            };
          }
          return dept;
        });

        newState = {
          ...prev,
          departments: finalDepartments,
        };
        return newState;
      });

      recordDecision(
        "order-release",
        `Rebalanced workload: moved ${
          ordersToMove.length
        } orders from departments [${sourceIds.join(
          ", "
        )}] to [${targetIds.join(", ")}]`,
        undefined,
        previousState,
        newState!
      );
    },
    [gameState, recordDecision]
  );

  // Complete processing in manual mode
  const completeProcessing = useCallback(
    (departmentId: number) => {
      const previousState = { ...gameState };
      let newState: GameState;

      setGameState((prev) => {
        const department = prev.departments.find((d) => d.id === departmentId);
        if (!department || !department.inProcess) {
          return prev;
        }

        const processingOrder = department.inProcess;
        const currentRouteStepIndex =
          processingOrder.route.indexOf(departmentId);

        if (currentRouteStepIndex === -1) {
          console.error(
            `Department ${departmentId} not found in order ${processingOrder.id} route`
          );
          return prev;
        }

        // Check if this is the last step in the route
        const isLastStep =
          currentRouteStepIndex >= processingOrder.route.length - 1;

        const updatedDepartments = prev.departments.map((dept) => {
          if (dept.id === departmentId) {
            return {
              ...dept,
              inProcess: undefined,
              totalProcessed: dept.totalProcessed + 1,
              utilization: dept.queue.length > 0 ? 75 : 0,
            };
          }
          return dept;
        });

        let updatedPendingOrders = [...prev.pendingOrders];
        let updatedCompletedOrders = [...prev.completedOrders];

        const completedOrder = {
          ...processingOrder,
          timestamps: [
            ...processingOrder.timestamps,
            {
              deptId: departmentId,
              start: new Date(Date.now() - 30000),
              end: new Date(),
            },
          ],
        };

        if (isLastStep) {
          // Order is fully completed - ensure all timestamps are present
          const now = new Date();
          
          // Create missing timestamps for any departments not yet timestamped
          const timestampedDeptIds = new Set(completedOrder.timestamps.map(t => t.deptId));
          completedOrder.route.forEach(deptId => {
            if (!timestampedDeptIds.has(deptId)) {
              // Add missing timestamp with both start and end
              completedOrder.timestamps.push({
                deptId,
                start: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
                end: now
              });
            }
          });
          
          // Ensure all timestamps have end times
          completedOrder.timestamps.forEach(timestamp => {
            if (!timestamp.end) {
              timestamp.end = now;
            }
          });
          
          // Update SLA status one final time before completion to ensure accuracy
          const finalCompletedOrder = updateSLAStatus(completedOrder);
          
          finalCompletedOrder.status =
            finalCompletedOrder.slaStatus === "overdue"
              ? "completed-late"
              : "completed-on-time";
          finalCompletedOrder.completedAt = now;
          finalCompletedOrder.actualLeadTime = Math.floor(
            (now.getTime() - finalCompletedOrder.createdAt.getTime()) / (60 * 1000)
          );
          updatedCompletedOrders.push(finalCompletedOrder);
        } else {
          // Move to next department - return to pending for manual assignment
          const nextDeptId = completedOrder.route[currentRouteStepIndex + 1];
          const nextDept = prev.departments.find((d) => d.id === nextDeptId);

          // Calculate processing time for the next department so we don't reuse
          // the previous department's processingTime. Store durations in ms.
          const nextProcessingTime = nextDept
            ? calculateProcessingTime(completedOrder, nextDept)
            : undefined;

          const updatedOrder: Order & { processingTime?: number; processingTimeRemaining?: number } = {
            ...completedOrder,
            currentStepIndex: currentRouteStepIndex + 1,
            status: "queued" as const,
            currentDepartment: undefined, // Clear current department so it goes back to pending
          };

          if (nextProcessingTime != null) {
            updatedOrder.processingTime = nextProcessingTime;
            updatedOrder.processingTimeRemaining = nextProcessingTime;
          } else {
            // Ensure we don't accidentally carry over old remaining time
            delete (updatedOrder as any).processingTimeRemaining;
          }

          updatedPendingOrders.push(updatedOrder as Order);
        }

        newState = {
          ...prev,
          departments: updatedDepartments,
          pendingOrders: updatedPendingOrders,
          completedOrders: updatedCompletedOrders,
        };
        return newState;
      });

      recordDecision(
        "order-release",
        `Manually completed processing of order in Department ${departmentId}`,
        undefined,
        previousState,
        newState!
      );
    },
    [gameState, recordDecision]
  );

  // Hold (pause) the current in-process order so another order can be processed
  const holdProcessing = useCallback(
    (departmentId: number) => {
      const previousState = { ...gameState };
      let newState: GameState;

      setGameState((prev) => {
        const dept = prev.departments.find((d) => d.id === departmentId);
        if (!dept || !dept.inProcess) return prev;

        const processingOrder = dept.inProcess;

        // Mark order as on-hold and push to end of queue so other orders may be processed
        const heldOrder = {
          ...processingOrder,
          status: "on-hold" as const,
          timestamps: [
            ...processingOrder.timestamps,
            { deptId: departmentId, start: new Date(), end: undefined as any },
          ],
        };

        const updatedDepartments = prev.departments.map((d) => {
          if (d.id === departmentId) {
            return {
              ...d,
              inProcess: undefined,
              queue: [...d.queue, heldOrder],
              utilization: d.queue.length > 0 ? 75 : 0,
              status: d.queue.length > 0 ? "available" : ("available" as const),
            };
          }
          return d;
        });

        newState = {
          ...prev,
          departments: updatedDepartments,
        };
        return newState;
      });

      recordDecision(
        "order-hold",
        `Held (paused) processing in Department ${departmentId}`,
        undefined,
        previousState,
        newState!
      );
    },
    [gameState, recordDecision]
  );

  // Resume a held order by moving it to the front of its department queue and clearing on-hold
  const resumeProcessing = useCallback(
    (orderId: string) => {
      const previousState = { ...gameState };
      let newState: GameState;

      setGameState((prev) => {
        const updatedDepartments = prev.departments.map((d) => {
          const idx = d.queue.findIndex((q) => q.id === orderId);
          if (idx !== -1) {
            const order = d.queue[idx];
            // Remove it from its position and place at front
            const newQueue = [
              ...d.queue.slice(0, idx),
              ...d.queue.slice(idx + 1),
            ];
            return {
              ...d,
              queue: [{ ...order, status: "queued" as const }, ...newQueue],
            };
          }
          return d;
        });

        newState = {
          ...prev,
          departments: updatedDepartments,
        };
        return newState;
      });

      recordDecision(
        "order-resume",
        `Resumed held order ${orderId}`,
        undefined,
        previousState,
        newState!
      );
    },
    [gameState, recordDecision]
  );

  // Start processing in manual mode
  const startProcessing = useCallback(
    (departmentId: number) => {
      const previousState = { ...gameState };
      let newState: GameState;

      setGameState((prev) => {
        const department = prev.departments.find((d) => d.id === departmentId);
        if (
          !department ||
          department.inProcess ||
          department.queue.length === 0
        ) {
          return prev;
        }

        // Get the first order from the queue
        const nextOrder = department.queue[0];
        const remainingQueue = department.queue.slice(1);

        // Determine processing time and remaining time.
        // If the order already has a `processingTimeRemaining` (from a previous hold),
        // preserve that value so resume continues where it left off. Otherwise
        // calculate the processing time now.
        let origTotalMs: number | undefined = undefined;
        let remainingMs: number;

        if (nextOrder.processingTimeRemaining != null) {
          // Preserve remaining time
          remainingMs = nextOrder.processingTimeRemaining;
        } else {
          // No remaining time tracked - calculate full processing time
          remainingMs = calculateProcessingTime(nextOrder, department);
        }

        // Preserve an original total if present (use it for progress calculations).
        if (nextOrder.processingTime != null) {
          // processingTime is expected to be stored in milliseconds
          origTotalMs = nextOrder.processingTime;
        } else {
          // fallback: use remaining as the total when original total unknown
          origTotalMs = remainingMs;
        }

        const updatedDepartments = prev.departments.map((dept) => {
          if (dept.id === departmentId) {
            return {
              ...dept,
              queue: remainingQueue,
              inProcess: {
                ...nextOrder,
                status: "processing" as const,
                // Keep the original session total (ms) and the remaining time (ms)
                processingTime: origTotalMs,
                processingTimeRemaining: remainingMs,
                currentOperationIndex: 0,
                operationProgress:
                  dept.operations.length > 0
                    ? [
                        {
                          operationId: dept.operations[0].id,
                          operationName: dept.operations[0].name,
                          startTime: new Date(),
                          duration: dept.operations[0].duration,
                          completed: false,
                        },
                      ]
                    : [],
                timestamps: [
                  ...nextOrder.timestamps,
                  { deptId: departmentId, start: new Date() },
                ],
              },
              utilization: 100, // Department is now busy
              status: "busy" as const,
            };
          }
          return dept;
        });

        newState = {
          ...prev,
          departments: updatedDepartments,
        };
        return newState;
      });

      recordDecision(
        "order-release",
        `Manually started processing order in Department ${departmentId}`,
        undefined,
        previousState,
        newState!
      );
    },
    [gameState, recordDecision, calculateProcessingTime]
  );

  return {
    gameState,
    isRunning,
    currentDecisionIndex,
    startGame,
    pauseGame,
    resetGame,
    optimizeOrderRoute,
    scheduleOrder,
    rebalanceWorkload,
    undoLastDecision,
    redoLastDecision,
    clearDecisionHistory,
    completeProcessing,
    startProcessing,
    holdProcessing,
    resumeProcessing,
    // Simulation speed control (1 = real-time, 2 = 2x, ...)
    simulationSpeed,
    setSimulationSpeed,
  };
};

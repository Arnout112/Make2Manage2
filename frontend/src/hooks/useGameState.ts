/**
 * Custom Hook for Game State Management
 * Educational Focus: Managing educational game progression and feedback
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { GameEngine } from "../services/gameEngine";
import type {
  GameState,
  GameConfiguration,
  PlayerDecision,
  DecisionOutcome,
  GamePhase,
  PerformanceMetrics,
} from "../types/game";
import type { Order } from "../types/orders";
import type { Customer } from "../types/customers";

export interface UseGameStateProps {
  initialConfig: GameConfiguration;
  onGameStateChange?: (gameState: GameState) => void;
  onDecisionOutcome?: (outcome: DecisionOutcome) => void;
}

export function useGameState({
  initialConfig,
  onGameStateChange,
  onDecisionOutcome,
}: UseGameStateProps) {
  // Core game state
  const [gameState, setGameState] = useState<GameState>(() =>
    GameEngine.initializeGame(initialConfig)
  );

  // Game data
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // UI state
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [currentHint, setCurrentHint] = useState<string>("");
  const [feedbackQueue, setFeedbackQueue] = useState<DecisionOutcome[]>([]);

  // Performance tracking
  const [weeklyMetrics, setWeeklyMetrics] = useState<PerformanceMetrics[]>([]);
  const [lastWeekReport, setLastWeekReport] = useState<{
    metrics: PerformanceMetrics;
    events: string[];
    learningInsights: string[];
  } | null>(null);

  // Calculate current performance metrics
  const currentMetrics = useMemo(
    () => GameEngine.calculatePerformanceMetrics(gameState, orders, customers),
    [gameState, orders, customers]
  );

  // Educational progress tracking
  const learningProgress = useMemo(() => {
    const totalObjectives = gameState.objectives.length;
    const completedObjectives = gameState.objectives.filter(
      (obj) => obj.completed
    ).length;
    const currentPhaseObjectives = gameState.objectives.filter(
      (obj) => obj.phase === gameState.currentPhase
    );
    const currentPhaseCompleted = currentPhaseObjectives.filter(
      (obj) => obj.completed
    ).length;

    return {
      overall:
        totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0,
      currentPhase:
        currentPhaseObjectives.length > 0
          ? (currentPhaseCompleted / currentPhaseObjectives.length) * 100
          : 0,
      totalObjectives,
      completedObjectives,
      currentPhaseObjectives: currentPhaseObjectives.length,
      currentPhaseCompleted,
    };
  }, [gameState.objectives, gameState.currentPhase]);

  // Get educational insights based on current state
  const educationalInsights = useMemo(() => {
    const insights: string[] = [];

    // Phase-specific insights
    switch (gameState.currentPhase) {
      case "tutorial":
        insights.push(
          "Focus on understanding the basic concepts of make-to-order manufacturing"
        );
        break;
      case "order-intake":
        insights.push("Practice customer order evaluation and prioritization");
        if (currentMetrics.customerSatisfaction < 70) {
          insights.push(
            "Customer satisfaction is low - focus on order approval decisions"
          );
        }
        break;
      case "production-planning":
        insights.push("Learn resource allocation and production scheduling");
        if (currentMetrics.resourceUtilization > 90) {
          insights.push(
            "High resource utilization - consider capacity planning"
          );
        }
        break;
      case "execution":
        insights.push("Manage production floor operations and quality control");
        if (currentMetrics.onTimeDelivery < 80) {
          insights.push(
            "On-time delivery is below target - review production processes"
          );
        }
        break;
      case "review":
        insights.push(
          "Analyze performance and identify improvement opportunities"
        );
        break;
    }

    // Performance-based insights
    if (gameState.totalScore < gameState.currentWeek * 50) {
      insights.push(
        "Score is below expected progress - review decision-making strategies"
      );
    }

    if (currentMetrics.profitMargin < 15) {
      insights.push(
        "Profit margins are low - consider cost optimization or pricing strategy"
      );
    }

    return insights;
  }, [gameState, currentMetrics]);

  // Decision processing function
  const makeDecision = useCallback(
    (
      decision: Omit<
        PlayerDecision,
        "id" | "timestamp" | "outcome" | "playerId"
      >
    ) => {
      const result = GameEngine.processDecision(
        gameState,
        { ...decision, playerId: "current-player" },
        orders,
        customers
      );

      // Update game state
      setGameState(result.updatedGameState);

      // Update orders and customers if changed
      if (result.updatedOrders) {
        setOrders(result.updatedOrders);
      }
      if (result.updatedCustomers) {
        setCustomers(result.updatedCustomers);
      }

      // Add feedback to queue
      setFeedbackQueue((prev) => [...prev, result.outcome]);

      // Notify listeners
      onGameStateChange?.(result.updatedGameState);
      onDecisionOutcome?.(result.outcome);

      return result.outcome;
    },
    [gameState, orders, customers, onGameStateChange, onDecisionOutcome]
  );

  // Phase management
  const completePhase = useCallback(
    (phase: GamePhase) => {
      const outcome = makeDecision({
        phase: gameState.currentPhase,
        decision: "phase_completed",
        context: { phase },
      });

      if (outcome.success) {
        // Advance to next phase
        const phaseOrder: GamePhase[] = [
          "tutorial",
          "order-intake",
          "production-planning",
          "execution",
          "review",
        ];
        const currentIndex = phaseOrder.indexOf(gameState.currentPhase);
        const nextPhase = phaseOrder[currentIndex + 1];

        if (nextPhase) {
          setGameState((prev) => ({
            ...prev,
            currentPhase: nextPhase,
          }));

          if (phase === "tutorial") {
            setGameState((prev) => ({ ...prev, tutorialCompleted: true }));
          }
        }
      }

      return outcome;
    },
    [gameState.currentPhase, makeDecision]
  );

  // Week advancement
  const advanceWeek = useCallback(() => {
    if (gameState.currentWeek >= gameState.totalWeeks) {
      return null;
    }

    const result = GameEngine.advanceWeek(gameState, orders, customers);

    setGameState(result.updatedGameState);
    setWeeklyMetrics((prev) => [...prev, result.weeklyReport.metrics]);
    setLastWeekReport(result.weeklyReport);
    setShowPerformanceModal(true);

    onGameStateChange?.(result.updatedGameState);

    return result.weeklyReport;
  }, [gameState, orders, customers, onGameStateChange]);

  // Learning objective management
  const completeObjective = useCallback((objectiveId: string) => {
    setGameState((prev) => ({
      ...prev,
      objectives: prev.objectives.map((obj) =>
        obj.id === objectiveId ? { ...obj, completed: true } : obj
      ),
    }));
  }, []);

  const getIncompleteObjectives = useCallback(() => {
    return gameState.objectives.filter(
      (obj) => !obj.completed && obj.phase === gameState.currentPhase
    );
  }, [gameState.objectives, gameState.currentPhase]);

  // Hint system
  const requestHint = useCallback(
    (context: string) => {
      const hint = GameEngine.generateHint(gameState, orders, context);
      setCurrentHint(hint);
      return hint;
    },
    [gameState, orders]
  );

  const clearHint = useCallback(() => {
    setCurrentHint("");
  }, []);

  // Feedback management
  const dismissFeedback = useCallback((index: number) => {
    setFeedbackQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllFeedback = useCallback(() => {
    setFeedbackQueue([]);
  }, []);

  // Game control functions
  const pauseGame = useCallback(() => {
    setIsGamePaused(true);
  }, []);

  const resumeGame = useCallback(() => {
    setIsGamePaused(false);
  }, []);

  const resetGame = useCallback(() => {
    const newGameState = GameEngine.initializeGame(initialConfig);
    setGameState(newGameState);
    setOrders([]);
    setCustomers([]);
    setWeeklyMetrics([]);
    setLastWeekReport(null);
    setFeedbackQueue([]);
    setCurrentHint("");
    setIsGamePaused(false);
    onGameStateChange?.(newGameState);
  }, [initialConfig, onGameStateChange]);

  // Auto-save effect
  useEffect(() => {
    const saveGameState = () => {
      try {
        localStorage.setItem(
          "make2manage-game-state",
          JSON.stringify({
            gameState,
            orders,
            customers,
            weeklyMetrics,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.warn("Failed to save game state:", error);
      }
    };

    const interval = setInterval(saveGameState, 30000); // Save every 30 seconds
    return () => clearInterval(interval);
  }, [gameState, orders, customers, weeklyMetrics]);

  // Load saved game state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("make2manage-game-state");
      if (saved) {
        const parsed = JSON.parse(saved);
        const timeDiff = Date.now() - parsed.timestamp;

        // Only load if saved within last hour
        if (timeDiff < 3600000) {
          setGameState(parsed.gameState);
          setOrders(parsed.orders || []);
          setCustomers(parsed.customers || []);
          setWeeklyMetrics(parsed.weeklyMetrics || []);
        }
      }
    } catch (error) {
      console.warn("Failed to load saved game state:", error);
    }
  }, []);

  return {
    // Core state
    gameState,
    orders,
    customers,

    // Metrics and progress
    currentMetrics,
    weeklyMetrics,
    lastWeekReport,
    learningProgress,
    educationalInsights,

    // UI state
    isGamePaused,
    showPerformanceModal,
    currentHint,
    feedbackQueue,

    // Game actions
    makeDecision,
    completePhase,
    advanceWeek,
    pauseGame,
    resumeGame,
    resetGame,

    // Learning actions
    completeObjective,
    getIncompleteObjectives,
    requestHint,
    clearHint,

    // UI actions
    setShowPerformanceModal,
    dismissFeedback,
    clearAllFeedback,

    // Data updates
    setOrders,
    setCustomers,
    updateGameState: setGameState,
  };
}

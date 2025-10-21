import { createContext, useContext } from "react";
import { useGameSimulation } from "../hooks/useGameSimulation";
import type { GameSettings, GameState } from "../types";
import type { ReactNode } from "react";

interface GameStateContextType {
  gameState: GameState;
  currentDecisionIndex: number;
  isRunning: boolean;
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
  releaseOrder: (orderId: string) => void;
  scheduleOrder: (
    orderId: string,
    departmentId: number,
    scheduledTime: Date
  ) => void;
  rebalanceWorkload: (
    sourceIds: number[],
    targetIds: number[],
    ordersToMove: string[]
  ) => void;
  undoLastDecision: () => void;
  redoLastDecision: () => void;
  clearDecisionHistory: () => void;
  optimizeOrderRoute: (orderId: string, newRoute: number[]) => void;
}

const GameStateContext = createContext<GameStateContextType | null>(null);

interface GameStateProviderProps {
  children: ReactNode;
  gameSettings: GameSettings;
}

export function GameStateProvider({
  children,
  gameSettings,
}: GameStateProviderProps) {
  try {
    const gameSimulation = useGameSimulation(gameSettings);

    const contextValue: GameStateContextType = {
      gameState: gameSimulation.gameState,
      currentDecisionIndex: gameSimulation.currentDecisionIndex,
      isRunning: gameSimulation.isRunning,
      startGame: gameSimulation.startGame,
      pauseGame: gameSimulation.pauseGame,
      resetGame: gameSimulation.resetGame,
      releaseOrder: gameSimulation.releaseOrder,
      scheduleOrder: gameSimulation.scheduleOrder,
      rebalanceWorkload: gameSimulation.rebalanceWorkload,
      undoLastDecision: gameSimulation.undoLastDecision,
      redoLastDecision: gameSimulation.redoLastDecision,
      clearDecisionHistory: gameSimulation.clearDecisionHistory,
      optimizeOrderRoute: gameSimulation.optimizeOrderRoute,
    };

    return (
      <GameStateContext.Provider value={contextValue}>
        {children}
      </GameStateContext.Provider>
    );
  } catch (error) {
    console.error("Error in GameStateProvider:", error);
    return (
      <div className="flex-1 p-8 bg-red-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>GameStateProvider Error:</strong> {error?.toString()}
          <details className="mt-2">
            <summary>Game Settings</summary>
            <pre className="text-xs mt-1">
              {JSON.stringify(gameSettings, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

export const useSharedGameState = (): GameStateContextType => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error(
      "useSharedGameState must be used within a GameStateProvider"
    );
  }
  return context;
};

import { Play, Pause, RotateCcw } from "lucide-react";
import HeaderEventsDisplay from "./HeaderEventsDisplay";
import type { GameSession, GameEvent } from "../../types";

interface GameControlsHeaderProps {
  gameSession: GameSession;
  events?: GameEvent[];
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  difficulty?: "easy" | "medium" | "hard";
  onDifficultyChange?: (difficulty: "easy" | "medium" | "hard") => void;
  simulationSpeed?: number;
  setSimulationSpeed?: (s: number) => void;
}

import { formatTime } from "../../utils/timeFormat";

export default function GameControlsHeader({
  gameSession,
  events = [],
  onStart,
  onPause,
  onReset,
  difficulty = "easy",
  onDifficultyChange,
  simulationSpeed = 1,
  setSimulationSpeed,
}: GameControlsHeaderProps) {
  return (
    <div className="w-full space-y-2">
      {/* Top Row - Game Controls */}
      <div className="flex items-center justify-between w-full">
        {/* Left Section - Game Status Indicator */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Status:</span>
            <span
              className={`text-sm font-medium px-2 py-1 rounded ${
                gameSession.status === "running"
                  ? "bg-green-100 text-green-800"
                  : gameSession.status === "paused"
                  ? "bg-yellow-100 text-yellow-800"
                  : gameSession.status === "completed"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {gameSession.status.charAt(0).toUpperCase() +
                gameSession.status.slice(1)}
            </span>
          </div>

          {/* Timer Display */}
          {gameSession.status !== "setup" && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Time:</span>
              <span className="font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded">
                {formatTime(gameSession.elapsedTime)}
              </span>
            </div>
          )}

          {/* Events Display */}
          <HeaderEventsDisplay events={events} />
        </div>

        {/* Right Section - Control Buttons (with margin to avoid accessibility settings) */}
        <div className="flex items-center space-x-2 mr-16">
          {gameSession.status === "setup" && (
            <button
              onClick={onStart}
              className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              <Play size={16} />
              <span>Start</span>
            </button>
          )}

          {gameSession.status === "running" && (
            <button
              onClick={onPause}
              className="flex items-center space-x-2 bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm"
            >
              <Pause size={16} />
              <span>Pause</span>
            </button>
          )}

          {/* Simulation speed control next to Pause/Resume */}
          {setSimulationSpeed && (
            <button
              onClick={() => {
                try {
                  const speeds = [1, 2, 4];
                  const idx = speeds.indexOf(simulationSpeed || 1);
                  const next = speeds[(idx + 1) % speeds.length];
                  setSimulationSpeed(next);
                } catch (e) {
                  console.error("Failed to change simulation speed", e);
                }
              }}
              className="flex items-center space-x-2 bg-gray-50 text-gray-800 px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-sm"
              title="Cycle simulation speed (1x → 2x → 4x)"
            >
              <span className="font-medium">x{simulationSpeed || 1}</span>
            </button>
          )}

          {gameSession.status === "paused" && (
            <button
              onClick={onStart}
              className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              <Play size={16} />
              <span>Resume</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="flex items-center space-x-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Bottom Row - Difficulty Selector */}
      {onDifficultyChange && (
        <div className="flex justify-center">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                Difficulty:
              </span>
              <select
                value={difficulty}
                onChange={(e) => {
                  const newDifficulty = e.target.value as
                    | "easy"
                    | "medium"
                    | "hard";
                  onDifficultyChange(newDifficulty);
                }}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
              <span className="text-xs text-gray-500">
                {difficulty === "easy" && "Slow pace, 15min"}
                {difficulty === "medium" && "Normal pace, 30min"}
                {difficulty === "hard" && "Fast pace, 60min"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

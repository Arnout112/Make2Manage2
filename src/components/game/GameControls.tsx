import React from "react";
import { Play, Pause, RotateCcw, Info } from "lucide-react";

interface GameControlsProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  gameState?: "setup" | "running" | "paused" | "completed";
  className?: string;
}

const GameControls: React.FC<GameControlsProps> = ({
  onStart,
  onPause,
  onReset,
  gameState = "setup",
  className,
}) => {
  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${
        className || ""
      }`}
    >
      {/* Game Instructions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Manual Order Processing
        </h3>
        <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How to play:</p>
            <p>
              Click orders to manually guide them through each department step
              by step. Follow the route sequence (e.g., 4→3→1→2) by clicking the
              order when it's ready for the next department.
            </p>
          </div>
        </div>
      </div>

      {/* Simple Game Controls */}
      <div className="space-y-3">
        {gameState === "setup" && (
          <button
            onClick={onStart}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Play size={20} />
            <span>Start Manual Processing</span>
          </button>
        )}

        {gameState === "running" && (
          <button
            onClick={onPause}
            className="w-full flex items-center justify-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
          >
            <Pause size={20} />
            <span>Pause Game</span>
          </button>
        )}

        {gameState === "paused" && (
          <button
            onClick={onStart}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Play size={20} />
            <span>Resume Processing</span>
          </button>
        )}

        <button
          onClick={onReset}
          className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw size={16} />
          <span>Reset Game</span>
        </button>
      </div>

      {/* Current Game State */}
      {gameState !== "setup" && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Game Status:</span>
            <span
              className={`font-medium capitalize ${
                gameState === "running"
                  ? "text-green-600"
                  : gameState === "paused"
                  ? "text-yellow-600"
                  : gameState === "completed"
                  ? "text-blue-600"
                  : "text-gray-600"
              }`}
            >
              {gameState}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;

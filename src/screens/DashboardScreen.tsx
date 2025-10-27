import { useState } from "react";
import { Lightbulb, X } from "lucide-react";
import Sidebar from "../components/layouts/Sidebar";
import Header from "../components/layouts/Header";
import { AccessibilityControls } from "../components";
import { GameControlsHeader } from "../components/game";
import {
  GameStateProvider,
  useSharedGameState,
} from "../contexts/GameStateContext";
import { getPriorityRuleDescription } from "../utils/priorityRules";
import { applyDifficultyPreset } from "../utils/gameInitialization";
import LandingScreen from "./LandingScreen";
import AnalyticsScreen from "./AnalyticsScreen";
import GameScreen from "./GameScreen";
import type { ScreenType, NavigationScreen, GameSettings } from "../types";

// Component to provide game controls using shared state
function GameControlsHeaderWrapper({
  difficulty,
  onDifficultyChange,
}: {
  difficulty: "easy" | "medium" | "hard";
  onDifficultyChange: (difficulty: "easy" | "medium" | "hard") => void;
}) {
  const { gameState, startGame, pauseGame, resetGame } = useSharedGameState();

  return (
    <GameControlsHeader
      gameSession={gameState.session}
      events={gameState.gameEvents}
      onStart={startGame}
      onPause={pauseGame}
      onReset={resetGame}
      difficulty={difficulty}
      onDifficultyChange={onDifficultyChange}
    />
  );
}

export default function DashboardScreen() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("landing");
  const [showHelpSidebar, setShowHelpSidebar] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("easy");

  // Use selected difficulty instead of random
  const presetSettings = applyDifficultyPreset(selectedDifficulty);

  // Shared game settings for all screens that need game state
  const sharedGameSettings: GameSettings = {
    sessionDuration: 15, // Default, can be overridden by preset
    gameSpeed: 1, // Default, can be overridden by preset
    orderGenerationRate: "low", // Default, can be overridden by preset
    complexityLevel: "beginner", // Default, can be overridden by preset
    enableEvents: true, // Default, can be overridden by preset
    enableAdvancedRouting: false, // Default, can be overridden by preset
    manualMode: true, // Always manual mode for educational experience
    randomSeed: "shared-game-seed-123",
    difficultyPreset: selectedDifficulty,
    ...presetSettings, // Apply preset overrides
  };

  const handleNavigationChange = (screen: NavigationScreen) => {
    setActiveScreen(screen);
  };

  const handleLandingNavigate = (
    screen: ScreenType,
    difficulty?: "easy" | "medium" | "hard"
  ) => {
    if (difficulty) {
      setSelectedDifficulty(difficulty);
    }
    setActiveScreen(screen);
  };

  const handleDifficultyChange = (
    newDifficulty: "easy" | "medium" | "hard"
  ) => {
    setSelectedDifficulty(newDifficulty);
    // The GameStateProvider will automatically reinitialize with new settings
  };

  const getScreenInfo = () => {
    switch (activeScreen) {
      case "landing":
        return {
          title: "Make2Manage",
          subtitle:
            "Digital Learning Game for Manufacturing Planning & Control",
        };
      case "game":
        return {
          title: "Make-to-Order Learning Game",
          subtitle: `${selectedDifficulty.toUpperCase()} Mode - Interactive Manufacturing Simulation`,
        };
      case "manual-game":
        return {
          title: "Manual Processing Game",
          subtitle: `${selectedDifficulty.toUpperCase()} Mode - Step-by-Step Order Processing Practice`,
        };
      case "analytics":
        return {
          title: "Statistics",
          subtitle: "Performance Analysis & Metrics",
        };
      default:
        return { title: "Make2Manage", subtitle: "Digital Learning Game" };
    }
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case "landing":
        return <LandingScreen onNavigate={handleLandingNavigate} />;
      case "game":
        return <GameScreen />;
      case "analytics":
        return <AnalyticsScreen />;
      default:
        return <LandingScreen onNavigate={handleLandingNavigate} />;
    }
  };

  const screenInfo = getScreenInfo();

  return (
    <div
      className="w-screen h-screen bg-white flex overflow-hidden"
      id="main-content"
    >
      {/* Accessibility Controls - Available globally */}
      <AccessibilityControls />{" "}
      {/* Render landing screen directly or wrap other screens with GameStateProvider */}
      {activeScreen === "landing" ? (
        renderActiveScreen()
      ) : (
        <GameStateProvider gameSettings={sharedGameSettings}>
          {/* Left Navigation Sidebar */}
          <Sidebar
            activeScreen={activeScreen}
            onScreenChange={handleNavigationChange}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header
              title={screenInfo.title}
              subtitle={screenInfo.subtitle}
              rightContent={
                activeScreen === "game" ? (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowHelpSidebar(!showHelpSidebar)}
                      className="flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-300 transition-colors"
                      title="Priority Rules Guide"
                    >
                      <Lightbulb className="w-5 h-5" />
                      <span className="text-sm font-medium">Tips & Rules</span>
                    </button>
                    <GameControlsHeaderWrapper
                      difficulty={selectedDifficulty}
                      onDifficultyChange={handleDifficultyChange}
                    />
                  </div>
                ) : undefined
              }
            />

            {/* Screen Content */}
            {renderActiveScreen()}
          </div>
        </GameStateProvider>
      )}
      {/* Help Sidebar - Only show on game screen */}
      {activeScreen === "game" && showHelpSidebar && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-2xl border-l border-gray-200 transform transition-transform">
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-yellow-50">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Priority Rules Guide
                </h3>
              </div>
              <button
                onClick={() => setShowHelpSidebar(false)}
                className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                title="Close guide"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Quick Tip */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Quick Tip
                      </h4>
                      <p className="text-blue-800 text-sm">
                        Each department has its own priority rule dropdown.
                        Change them to see how different scheduling strategies
                        affect order flow.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Priority Rules */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">
                    Priority Rules Explained
                  </h4>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h5 className="font-semibold text-gray-800 mb-2">
                        FIFO (First In, First Out)
                      </h5>
                      <p className="text-gray-700 text-sm">
                        {getPriorityRuleDescription("FIFO")}
                      </p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h5 className="font-semibold text-gray-800 mb-2">
                        EDD (Earliest Due Date)
                      </h5>
                      <p className="text-gray-700 text-sm">
                        {getPriorityRuleDescription("EDD")}
                      </p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h5 className="font-semibold text-gray-800 mb-2">
                        SPT (Shortest Processing Time)
                      </h5>
                      <p className="text-gray-700 text-sm">
                        {getPriorityRuleDescription("SPT")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Tips */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Educational Tips
                  </h4>
                  <ul className="text-green-800 text-sm space-y-2">
                    <li>
                      • Try different combinations of rules across departments
                    </li>
                    <li>• Watch how queue ordering changes in real-time</li>
                    <li>
                      • Notice the impact on delivery dates and priorities
                    </li>
                    <li>
                      • Experiment with high-priority vs. low-priority orders
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar Overlay */}
      {activeScreen === "game" && showHelpSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowHelpSidebar(false)}
        />
      )}
    </div>
  );
}

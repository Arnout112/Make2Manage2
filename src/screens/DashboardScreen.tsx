import { useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Header from "../components/layouts/Header";
import { AccessibilityControls } from "../components";
import { GameControlsHeader } from "../components/game";
import { GameStateProvider, useSharedGameState } from "../contexts/GameStateContext";
import LandingScreen from "./LandingScreen";
import GameScreen from "./GameScreen";
import AnalyticsScreen from "./AnalyticsScreen";
import ManualGameScreen from "./ManualGameScreen";
import type { ScreenType, NavigationScreen, GameSettings } from "../types";

// Component to provide game controls using shared state
function GameControlsHeaderWrapper() {
  const { gameState, startGame, pauseGame, resetGame } = useSharedGameState();
  
  return (
    <GameControlsHeader
      gameSession={gameState.session}
      events={gameState.gameEvents}
      onStart={startGame}
      onPause={pauseGame}
      onReset={resetGame}
    />
  );
}

export default function DashboardScreen() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("landing");

  // Shared game settings for all screens that need game state
  const sharedGameSettings: GameSettings = {
    sessionDuration: 15, // Shorter sessions for manual learning
    gameSpeed: 1, // Normal speed for learning
    orderGenerationRate: "low", // Slower pace for manual processing
    complexityLevel: "beginner", // Start with beginner level
    enableEvents: true, // Keep events for learning scenarios
    enableAdvancedRouting: false, // Simplify for manual mode
    randomSeed: "shared-game-seed-123",
  };

  const handleNavigationChange = (screen: NavigationScreen) => {
    setActiveScreen(screen);
  };

  const handleLandingNavigate = (screen: ScreenType) => {
    setActiveScreen(screen);
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
          subtitle: "Interactive Manufacturing Simulation",
        };
      case "manual-game":
        return {
          title: "Manual Processing Game",
          subtitle: "Step-by-Step Order Processing Practice",
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
      case "manual-game":
        return <ManualGameScreen />;
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
      <AccessibilityControls />

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
                activeScreen === "manual-game" ? (
                  <GameControlsHeaderWrapper />
                ) : undefined
              }
            />

            {/* Screen Content */}
            {renderActiveScreen()}
          </div>
        </GameStateProvider>
      )}
    </div>
  );
}

import { useState } from "react";
import Sidebar from "../components/layouts/Sidebar";
import Header from "../components/layouts/Header";
import { AccessibilityControls } from "../components";
import LandingScreen from "./LandingScreen";
import GameScreen from "./GameScreen";
import AnalyticsScreen from "./AnalyticsScreen";
import ManualGameScreen from "./ManualGameScreen";
import type { ScreenType, NavigationScreen } from "../types";

export default function DashboardScreen() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("landing");

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

      {/* Left Navigation Sidebar - only show when not on landing page */}
      {activeScreen !== "landing" && (
        <Sidebar
          activeScreen={activeScreen}
          onScreenChange={handleNavigationChange}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {activeScreen !== "landing" && (
          <Header title={screenInfo.title} subtitle={screenInfo.subtitle} />
        )}

        {/* Screen Content */}
        {renderActiveScreen()}
      </div>
    </div>
  );
}

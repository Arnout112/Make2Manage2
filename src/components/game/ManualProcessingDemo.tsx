import React, { useState } from "react";
import GameControls from "./GameControls";
import OrderProcessingGuide from "./OrderProcessingGuide";

// Mock data for demonstration
const mockOrders = [
  {
    id: "ORD-001",
    customerName: "TechCorp Ltd",
    route: [4, 3, 1, 2], // Machining → QC → Assembly → Packaging
    currentStep: 0,
    status: "in-progress" as const,
  },
  {
    id: "ORD-002",
    customerName: "Manufacturing Inc",
    route: [1, 3, 2], // Assembly → QC → Packaging
    currentStep: 1,
    status: "in-progress" as const,
  },
  {
    id: "ORD-003",
    customerName: "Industrial Solutions",
    route: [4, 1, 3, 2], // Machining → Assembly → QC → Packaging
    currentStep: 4, // Completed
    status: "completed" as const,
  },
];

const ManualProcessingDemo: React.FC = () => {
  const [gameState, setGameState] = useState<
    "setup" | "running" | "paused" | "completed"
  >("setup");
  const [orders, setOrders] = useState(mockOrders);

  const handleStart = () => {
    setGameState("running");
  };

  const handlePause = () => {
    setGameState(gameState === "paused" ? "running" : "paused");
  };

  const handleReset = () => {
    setGameState("setup");
    setOrders(mockOrders); // Reset to initial state
  };

  const handleOrderClick = (orderId: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId && order.status === "in-progress") {
          const nextStep = order.currentStep + 1;
          const isCompleted = nextStep >= order.route.length;

          return {
            ...order,
            currentStep: nextStep,
            status: isCompleted
              ? ("completed" as const)
              : ("in-progress" as const),
          };
        }
        return order;
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Make2Manage - Manual Order Processing
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Game Controls */}
          <div>
            <GameControls
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              gameState={gameState}
            />
          </div>

          {/* Order Processing Guide */}
          <div>
            <OrderProcessingGuide
              orders={orders}
              onOrderClick={handleOrderClick}
              departmentNames={{
                1: "Assembly",
                2: "Packaging",
                3: "Quality Control",
                4: "Machining",
              }}
            />
          </div>
        </div>

        {/* Educational Information */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Learning Objectives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Manufacturing Flow
              </h4>
              <p className="text-sm text-gray-600">
                Understand how orders move through different departments in a
                specific sequence to complete production.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Manual Coordination
              </h4>
              <p className="text-sm text-gray-600">
                Learn the importance of coordination and timing when managing
                multiple orders through the production process.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Route Optimization
              </h4>
              <p className="text-sm text-gray-600">
                Experience how different routing decisions affect throughput and
                delivery times.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Resource Management
              </h4>
              <p className="text-sm text-gray-600">
                Develop awareness of department capacity and the impact of
                bottlenecks on overall performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualProcessingDemo;

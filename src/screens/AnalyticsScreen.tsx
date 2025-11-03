import { Clock, CheckCircle, Factory, AlertTriangle } from "lucide-react";
import { useSharedGameState } from "../contexts/GameStateContext";
import { PerformanceDashboard } from "../components";

export default function AnalyticsScreen() {
  // Use shared game state for performance data with error handling
  let gameState;
  try {
    const sharedState = useSharedGameState();
    gameState = sharedState.gameState;
  } catch (error) {
    console.error("AnalyticsScreen: Error accessing shared game state:", error);
    gameState = null;
  }

  // Filter options removed (non-functional)

  const kpiCards = [
    {
      title: "Avg Lead Time",
      value: "4.2h",
      color: "blue",
      icon: Clock,
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "On-Time %",
      value: "87%",
      color: "green",
      icon: CheckCircle,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Bottleneck",
      value: "Dept 4",
      color: "amber",
      icon: Factory,
      trend: "91% util",
      trendUp: false,
    },
    {
      title: "Rework Rate",
      value: "3%",
      color: "red",
      icon: AlertTriangle,
      trend: "-2%",
      trendUp: false,
    },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
      {/* Top filter options removed per request */}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card, index) => {
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            green: "bg-green-100 text-green-600",
            amber: "bg-amber-100 text-amber-600",
            red: "bg-red-100 text-red-600",
          };

          return (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center"
            >
              <div
                className={`w-12 h-12 ${
                  colorClasses[card.color as keyof typeof colorClasses]
                } rounded-lg flex items-center justify-center mx-auto mb-3`}
              >
                <card.icon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-800">{card.title}</h4>
              <p
                className={`text-2xl font-bold mt-1 ${
                  card.color === "blue"
                    ? "text-blue-600"
                    : card.color === "green"
                    ? "text-green-600"
                    : card.color === "amber"
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {card.value}
              </p>
              <div
                className={`text-sm mt-2 flex items-center justify-center ${
                  card.trendUp ? "text-green-600" : "text-red-600"
                }`}
              >
                <span>{card.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Panels */}
      <div className="space-y-8">
        {/* Process Analysis and Performance Metrics panels removed per request */}

        {/* Detailed Data Tables */}
        <div className="grid grid-cols-2 gap-8">
          {/* Order-Level Data */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Order Performance
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">Order ID</th>
                    <th className="text-left py-2 text-gray-600">Lead Time</th>
                    <th className="text-left py-2 text-gray-600">On Time</th>
                    <th className="text-left py-2 text-gray-600">Rework</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono">ORD-001</td>
                    <td className="py-2">3.2h</td>
                    <td className="py-2">
                      <span className="text-green-600 font-medium">Yes</span>
                    </td>
                    <td className="py-2">0</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono">ORD-002</td>
                    <td className="py-2">5.1h</td>
                    <td className="py-2">
                      <span className="text-red-600 font-medium">No</span>
                    </td>
                    <td className="py-2">1</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-mono">ORD-003</td>
                    <td className="py-2">4.0h</td>
                    <td className="py-2">
                      <span className="text-green-600 font-medium">Yes</span>
                    </td>
                    <td className="py-2">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Department-Level Data */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Department Performance
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">Department</th>
                    <th className="text-left py-2 text-gray-600">
                      Utilization
                    </th>
                    <th className="text-left py-2 text-gray-600">Avg Cycle</th>
                    <th className="text-left py-2 text-gray-600">Queue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium">Dept 1</td>
                    <td className="py-2">65%</td>
                    <td className="py-2">45m</td>
                    <td className="py-2">2</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium">Dept 2</td>
                    <td className="py-2">82%</td>
                    <td className="py-2">38m</td>
                    <td className="py-2">3</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium">Dept 3</td>
                    <td className="py-2">58%</td>
                    <td className="py-2">52m</td>
                    <td className="py-2">1</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium">Dept 4</td>
                    <td className="py-2">
                      <span className="text-red-600 font-medium">91%</span>
                    </td>
                    <td className="py-2">28m</td>
                    <td className="py-2">
                      <span className="text-red-600 font-medium">5</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Analysis filter controls removed per request */}
      </div>

      {/* Performance Dashboard */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Performance Dashboard
        </h2>
        {gameState ? (
          <PerformanceDashboard
            gameState={gameState}
            onExportMetrics={() => {
              console.log("Exporting performance metrics from Analytics");
              // Export comprehensive performance data
            }}
          />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800">
              Performance dashboard unavailable - no game state
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

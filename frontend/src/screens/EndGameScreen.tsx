import React, { useState } from "react";
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Factory,
  CheckCircle,
  Download,
  Mail,
  X,
} from "lucide-react";
import { useSharedGameState } from "../contexts/GameStateContext";
import { formatCurrency } from "../utils/formatters";
import { ExportModal } from "../components";

const EndGameScreen: React.FC = () => {
  const { gameState } = useSharedGameState();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLegacyExportModal, setShowLegacyExportModal] = useState(false);
  const [emailData, setEmailData] = useState({
    studentName: "",
    studentEmail: "",
    teacherEmail: "",
    courseName: "",
  });

  // Helper to format lead time in minutes
  const formatLeadTime = (minutes: number) => {
    if (minutes === 0) return "0m";
    return `${Math.round(minutes)}m`;
  };

  // Export data to CSV
  const exportToCSV = () => {
    const csvData = [
      ["Make2Manage - Game Results"],
      ["Generated on:", new Date().toLocaleString()],
      [""],
      ["Session Summary"],
      ["Duration (minutes):", sessionDuration.toString()],
      ["Completed Orders:", completedOrders.length.toString()],
      ["Total Revenue:", formatCurrency(totalRevenue)],
      [""],
      ["Key Performance Indicators"],
      ["On-Time Delivery Rate:", `${onTimeRate.toFixed(1)}%`],
      ["Average Lead Time:", formatLeadTime(averageLeadTime)],
      ["Average Utilization:", `${averageUtilization.toFixed(1)}%`],
      ["Average Order Value:", formatCurrency(averageOrderValue)],
      [""],
      ["Industry Benchmarks Comparison"],
      [
        "Metric",
        "Your Performance",
        "Industry Target",
        "Competitor Average",
        "Status",
      ],
      [
        "On-Time Delivery",
        `${onTimeRate.toFixed(1)}%`,
        `${benchmarks.industryStandards.onTimeDeliveryRate.excellent}%`,
        `${benchmarks.competitorAverages.onTimeDeliveryRate}%`,
        getBenchmarkStatus(
          onTimeRate,
          benchmarks.industryStandards.onTimeDeliveryRate
        ).status,
      ],
      [
        "Lead Time",
        formatLeadTime(averageLeadTime),
        `${benchmarks.industryStandards.leadTime.excellent}m`,
        `${benchmarks.competitorAverages.leadTime}m`,
        getBenchmarkStatus(
          averageLeadTime,
          benchmarks.industryStandards.leadTime,
          true
        ).status,
      ],
      [
        "Utilization",
        `${averageUtilization.toFixed(1)}%`,
        `${benchmarks.industryStandards.utilizationRate.excellent}%`,
        `${benchmarks.competitorAverages.utilizationRate}%`,
        getBenchmarkStatus(
          averageUtilization,
          benchmarks.industryStandards.utilizationRate
        ).status,
      ],
      [""],
      ["Department Performance"],
      [
        "Department",
        "Utilization %",
        "Orders Processed",
        "Processing Rate (orders/hr)",
        "Queue Length",
      ],
      ...departmentStats.map((dept) => {
        const sessionMinutes = Math.max(
          1,
          gameState.session.elapsedTime / (60 * 1000)
        );
        const processingRate = ((dept.processed / sessionMinutes) * 60).toFixed(
          1
        );
        return [
          dept.name,
          dept.utilization.toFixed(1),
          dept.processed.toString(),
          processingRate,
          dept.queueLength.toString(),
        ];
      }),
      [""],
      ["Priority Performance"],
      ["Priority Level", "Total Orders", "On-Time Orders", "On-Time Rate %"],
      ...priorityStats.map((stat) => [
        stat.priority,
        stat.total.toString(),
        stat.onTime.toString(),
        stat.rate.toFixed(1),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Make2Manage_Results_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate HTML dashboard export
  const generateDashboardHTML = () => {
    return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Make2Manage - Game Results Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; margin: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2rem; font-weight: bold; margin: 10px 0; }
        .stat-label { color: #6b7280; font-size: 0.9rem; }
        .benchmark { margin-top: 10px; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
        .excellent { background: #d1fae5; color: #065f46; }
        .good { background: #dbeafe; color: #1e40af; }
        .average { background: #fef3c7; color: #92400e; }
        .poor { background: #fee2e2; color: #991b1b; }
        .section-title { font-size: 1.5rem; font-weight: bold; margin: 30px 0 15px 0; color: #374151; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; color: #374151; }
        .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Make2Manage - Game Results Dashboard</h1>
            <p><strong>Student:</strong> ${
              emailData.studentName
            } | <strong>Cursus:</strong> ${emailData.courseName}</p>
            <p><strong>Datum:</strong> ${new Date().toLocaleDateString(
              "nl-NL"
            )} | <strong>Sessie Duur:</strong> ${sessionDuration} minuten</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Voltooide Orders</div>
                <div class="stat-value" style="color: #059669;">${
                  completedOrders.length
                }</div>
                <div class="benchmark ${
                  getBenchmarkStatus(completedOrders.length, {
                    poor: 3,
                    average: 5,
                    excellent: 15,
                  }).status
                }">${getBenchmarkStatus(completedOrders.length, {
      poor: 3,
      average: 5,
      excellent: 15,
    }).status.toUpperCase()}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">Op-tijd Levering</div>
                <div class="stat-value" style="color: #dc2626;">${onTimeRate.toFixed(
                  1
                )}%</div>
                <div class="benchmark ${
                  getBenchmarkStatus(
                    onTimeRate,
                    benchmarks.industryStandards.onTimeDeliveryRate
                  ).status
                }">${getBenchmarkStatus(
      onTimeRate,
      benchmarks.industryStandards.onTimeDeliveryRate
    ).status.toUpperCase()}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">Gemiddelde Doorlooptijd</div>
                <div class="stat-value" style="color: #7c3aed;">${formatLeadTime(
                  averageLeadTime
                )}</div>
                <div class="benchmark ${
                  getBenchmarkStatus(
                    averageLeadTime,
                    benchmarks.industryStandards.leadTime,
                    true
                  ).status
                }">${getBenchmarkStatus(
      averageLeadTime,
      benchmarks.industryStandards.leadTime,
      true
    ).status.toUpperCase()}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">Totale Omzet</div>
                <div class="stat-value" style="color: #059669;">${formatCurrency(
                  totalRevenue
                )}</div>
                <div class="benchmark ${
                  getBenchmarkStatus(totalRevenue, {
                    poor: 30000,
                    average: 50000,
                    excellent: 150000,
                  }).status
                }">${getBenchmarkStatus(totalRevenue, {
      poor: 30000,
      average: 50000,
      excellent: 150000,
    }).status.toUpperCase()}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">Gemiddelde Bezetting</div>
                <div class="stat-value" style="color: #dc2626;">${averageUtilization.toFixed(
                  1
                )}%</div>
                <div class="benchmark ${
                  getBenchmarkStatus(
                    averageUtilization,
                    benchmarks.industryStandards.utilizationRate
                  ).status
                }">${getBenchmarkStatus(
      averageUtilization,
      benchmarks.industryStandards.utilizationRate
    ).status.toUpperCase()}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">Gemiddelde Order Waarde</div>
                <div class="stat-value" style="color: #0891b2;">${formatCurrency(
                  averageOrderValue
                )}</div>
                <div class="benchmark ${
                  getBenchmarkStatus(averageOrderValue, {
                    poor: 3000,
                    average: 5000,
                    excellent: 12000,
                  }).status
                }">${getBenchmarkStatus(averageOrderValue, {
      poor: 3000,
      average: 5000,
      excellent: 12000,
    }).status.toUpperCase()}</div>
            </div>
        </div>

        <h2 class="section-title">Afdeling Prestaties</h2>
        <table>
            <thead>
                <tr>
                    <th>Afdeling</th>
                    <th>Bezetting</th>
                    <th>Orders Verwerkt</th>
                    <th>Verwerkingssnelheid</th>
                    <th>Wachtrij Lengte</th>
                </tr>
            </thead>
            <tbody>
                ${departmentStats
                  .map((dept) => {
                    const sessionMinutes = Math.max(
                      1,
                      gameState.session.elapsedTime / (60 * 1000)
                    );
                    const processingRate = (
                      (dept.processed / sessionMinutes) *
                      60
                    ).toFixed(1);
                    return `<tr>
                    <td>${dept.name}</td>
                    <td>${dept.utilization.toFixed(1)}%</td>
                    <td>${dept.processed}</td>
                    <td>${processingRate} orders/uur</td>
                    <td>${dept.queueLength}</td>
                  </tr>`;
                  })
                  .join("")}
            </tbody>
        </table>

        <h2 class="section-title">Prioriteit Prestaties</h2>
        <table>
            <thead>
                <tr>
                    <th>Prioriteit Niveau</th>
                    <th>Totaal Orders</th>
                    <th>Op-tijd Orders</th>
                    <th>Op-tijd Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${priorityStats
                  .map(
                    (stat) => `<tr>
                  <td>${stat.priority}</td>
                  <td>${stat.total}</td>
                  <td>${stat.onTime}</td>
                  <td>${stat.rate.toFixed(1)}%</td>
                </tr>`
                  )
                  .join("")}
            </tbody>
        </table>

        <h2 class="section-title">Industrie Benchmark Vergelijking</h2>
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Jouw Prestatie</th>
                    <th>Industrie Target</th>
                    <th>Concurrent Gemiddelde</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Op-tijd Levering</td>
                    <td>${onTimeRate.toFixed(1)}%</td>
                    <td>${
                      benchmarks.industryStandards.onTimeDeliveryRate.excellent
                    }%</td>
                    <td>${
                      benchmarks.competitorAverages.onTimeDeliveryRate
                    }%</td>
                    <td><span class="benchmark ${
                      getBenchmarkStatus(
                        onTimeRate,
                        benchmarks.industryStandards.onTimeDeliveryRate
                      ).status
                    }">${getBenchmarkStatus(
      onTimeRate,
      benchmarks.industryStandards.onTimeDeliveryRate
    ).status.toUpperCase()}</span></td>
                </tr>
                <tr>
                    <td>Doorlooptijd</td>
                    <td>${formatLeadTime(averageLeadTime)}</td>
                    <td>${benchmarks.industryStandards.leadTime.excellent}m</td>
                    <td>${benchmarks.competitorAverages.leadTime}m</td>
                    <td><span class="benchmark ${
                      getBenchmarkStatus(
                        averageLeadTime,
                        benchmarks.industryStandards.leadTime,
                        true
                      ).status
                    }">${getBenchmarkStatus(
      averageLeadTime,
      benchmarks.industryStandards.leadTime,
      true
    ).status.toUpperCase()}</span></td>
                </tr>
                <tr>
                    <td>Bezetting</td>
                    <td>${averageUtilization.toFixed(1)}%</td>
                    <td>${
                      benchmarks.industryStandards.utilizationRate.excellent
                    }%</td>
                    <td>${benchmarks.competitorAverages.utilizationRate}%</td>
                    <td><span class="benchmark ${
                      getBenchmarkStatus(
                        averageUtilization,
                        benchmarks.industryStandards.utilizationRate
                      ).status
                    }">${getBenchmarkStatus(
      averageUtilization,
      benchmarks.industryStandards.utilizationRate
    ).status.toUpperCase()}</span></td>
                </tr>
            </tbody>
        </table>

        <div class="footer">
            <p>Gegenereerd door Make2Manage Leeromgeving - ${new Date().toLocaleString(
              "nl-NL"
            )}</p>
        </div>
    </div>
</body>
</html>`;
  };

  // Export dashboard as HTML file
  const exportDashboardHTML = () => {
    const htmlContent = generateDashboardHTML();
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Make2Manage_Dashboard_${emailData.studentName || "Student"}_${new Date()
        .toISOString()
        .slice(0, 10)}.html`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate email content - simplified for mailto compatibility
  const generateEmailContent = () => {
    const subject = `Make2Manage Game Results - ${emailData.studentName}`;
    const body = `Beste leraar,

Hierbij de resultaten van de Make2Manage simulatie:

STUDENT INFORMATIE:
- Naam: ${emailData.studentName}
- Email: ${emailData.studentEmail}
- Cursus: ${emailData.courseName}
- Datum: ${new Date().toLocaleDateString("nl-NL")}
- Sessie Duur: ${sessionDuration} minuten

PRESTATIE OVERZICHT:
- Voltooide Orders: ${completedOrders.length}
- Totale Omzet: ${formatCurrency(totalRevenue)}
- Op-tijd Levering: ${onTimeRate.toFixed(1)}% (target: ${
      benchmarks.industryStandards.onTimeDeliveryRate.excellent
    }%)
- Gemiddelde Doorlooptijd: ${formatLeadTime(averageLeadTime)} (target: ${
      benchmarks.industryStandards.leadTime.excellent
    }m)
- Gemiddelde Bezetting: ${averageUtilization.toFixed(1)}% (target: ${
      benchmarks.industryStandards.utilizationRate.excellent
    }%)

BENCHMARK STATUS:
- Op-tijd Levering: ${getBenchmarkStatus(
      onTimeRate,
      benchmarks.industryStandards.onTimeDeliveryRate
    ).status.toUpperCase()}
- Doorlooptijd: ${getBenchmarkStatus(
      averageLeadTime,
      benchmarks.industryStandards.leadTime,
      true
    ).status.toUpperCase()}
- Bezetting: ${getBenchmarkStatus(
      averageUtilization,
      benchmarks.industryStandards.utilizationRate
    ).status.toUpperCase()}

AFDELING PRESTATIES:
${departmentStats
  .map((dept) => {
    const sessionMinutes = Math.max(
      1,
      gameState.session.elapsedTime / (60 * 1000)
    );
    const processingRate = ((dept.processed / sessionMinutes) * 60).toFixed(1);
    return `- ${dept.name}: ${dept.utilization.toFixed(1)}% bezetting, ${
      dept.processed
    } orders (${processingRate}/uur)`;
  })
  .join("\n")}

PRIORITEIT PRESTATIES:
${priorityStats
  .map(
    (stat) =>
      `- ${stat.priority}: ${stat.rate.toFixed(1)}% op tijd (${stat.onTime}/${
        stat.total
      })`
  )
  .join("\n")}

Voor een visueel dashboard met alle details, download het HTML bestand via de game interface.

Met vriendelijke groet,
Make2Manage Leeromgeving`;

    return { subject, body };
  };

  // Send email to teacher - simplified for compatibility
  const sendEmailToTeacher = () => {
    const { subject, body } = generateEmailContent();
    const mailtoLink = `mailto:${
      emailData.teacherEmail
    }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");
    setShowLegacyExportModal(false);
  };

  // Calculate comprehensive statistics
  const completedOrders = gameState.completedOrders;
  const onTimeOrders = completedOrders.filter(
    (order) => order.status === "completed-on-time"
  );

  const onTimeRate =
    completedOrders.length > 0
      ? (onTimeOrders.length / completedOrders.length) * 100
      : 0;
  const averageLeadTime =
    completedOrders.length > 0
      ? completedOrders.reduce(
          (sum, order) => sum + (order.actualLeadTime || 0),
          0
        ) / completedOrders.length
      : 0;

  const totalRevenue = gameState.totalScore;
  const averageOrderValue =
    completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Department statistics
  const departmentStats = gameState.departments.map((dept) => {
    return {
      name:
        {
          1: "Welding",
          2: "Machining",
          3: "Painting",
          4: "Assembly",
          5: "Engineering",
        }[dept.id] || `Dept ${dept.id}`,
      utilization: dept.utilization,
      processed: dept.totalProcessed,
      queueLength: dept.queue.length,
      currentUtilization: dept.utilization, // Keep original for debugging
    };
  });

  const averageUtilization =
    departmentStats.reduce((sum, dept) => sum + dept.utilization, 0) /
    departmentStats.length;

  // Priority performance
  const priorityStats = ["urgent", "high", "normal", "low"].map((priority) => {
    const orders = completedOrders.filter(
      (order) => order.priority === priority
    );
    const onTime = orders.filter(
      (order) => order.status === "completed-on-time"
    ).length;
    return {
      priority: priority.toUpperCase(),
      total: orders.length,
      onTime,
      rate: orders.length > 0 ? (onTime / orders.length) * 100 : 0,
    };
  });

  const sessionDuration = Math.round(
    gameState.session.elapsedTime / (60 * 1000)
  ); // Convert to minutes

  // Industry benchmarks (same as PerformanceDashboard)
  const benchmarks = {
    industryStandards: {
      onTimeDeliveryRate: { poor: 70, average: 85, excellent: 95 },
      utilizationRate: { poor: 50, average: 75, excellent: 85 },
      leadTime: { poor: 120, average: 60, excellent: 30 }, // minutes
      throughput: { poor: 5, average: 15, excellent: 25 }, // orders per hour
      customerSatisfaction: { poor: 70, average: 85, excellent: 95 },
    },
    competitorAverages: {
      onTimeDeliveryRate: 82,
      utilizationRate: 73,
      leadTime: 65, // minutes
      throughput: 12, // orders per hour
      customerSatisfaction: 81,
    },
  };

  // Helper function to get benchmark status
  const getBenchmarkStatus = (
    value: number,
    standards: { poor: number; average: number; excellent: number },
    isLowerBetter = false
  ) => {
    if (isLowerBetter) {
      if (value <= standards.excellent)
        return { status: "excellent", color: "text-green-600" };
      if (value <= standards.average)
        return { status: "good", color: "text-blue-600" };
      if (value <= standards.poor)
        return { status: "average", color: "text-yellow-600" };
      return { status: "poor", color: "text-red-600" };
    } else {
      if (value >= standards.excellent)
        return { status: "excellent", color: "text-green-600" };
      if (value >= standards.average)
        return { status: "good", color: "text-blue-600" };
      if (value >= standards.poor)
        return { status: "average", color: "text-yellow-600" };
      return { status: "poor", color: "text-red-600" };
    }
  };

  return (
    <div className="p-6 space-y-6 w-full min-h-screen overflow-y-auto">
      {/* Real Data Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <p className="text-blue-800 font-medium">
            All statistics below are calculated from your actual game
            performance
          </p>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          Based on {completedOrders.length} completed orders, {sessionDuration}{" "}
          minutes of gameplay, and{" "}
          {gameState.departments.reduce((sum, d) => sum + d.totalProcessed, 0)}{" "}
          total department operations
        </p>
      </div>

      {/* Header */}
      <div className="text-center space-y-4 relative">
        {/* Export Button - Top Right */}
        <div className="absolute top-0 right-0">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg"
            title="Export resultaten en mail naar leraar"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        <div className="flex justify-center items-center space-x-3">
          <Trophy className="w-12 h-12 text-yellow-500" />
          <h1 className="text-4xl font-bold text-gray-900">Game Complete!</h1>
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>
        <p className="text-xl text-gray-600">
          Session Duration: {sessionDuration} minutes • {completedOrders.length}{" "}
          orders completed
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              On-Time Delivery
            </h3>
          </div>
          <div className="space-y-2">
            <div
              className={`text-3xl font-bold ${
                getBenchmarkStatus(
                  onTimeRate,
                  benchmarks.industryStandards.onTimeDeliveryRate
                ).color
              }`}
            >
              {onTimeRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              {onTimeOrders.length} of {completedOrders.length} orders
            </div>
            <div className="text-xs text-gray-500">
              Industry Target:{" "}
              {benchmarks.industryStandards.onTimeDeliveryRate.excellent}% •
              Competitor Avg: {benchmarks.competitorAverages.onTimeDeliveryRate}
              %
            </div>
            <div
              className={`text-xs font-medium ${
                getBenchmarkStatus(
                  onTimeRate,
                  benchmarks.industryStandards.onTimeDeliveryRate
                ).color
              }`}
            >
              {getBenchmarkStatus(
                onTimeRate,
                benchmarks.industryStandards.onTimeDeliveryRate
              ).status.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-8 h-8 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Lead Time</h3>
          </div>
          <div className="space-y-2">
            <div
              className={`text-3xl font-bold ${
                getBenchmarkStatus(
                  averageLeadTime,
                  benchmarks.industryStandards.leadTime,
                  true
                ).color
              }`}
            >
              {formatLeadTime(averageLeadTime)}
            </div>
            <div className="text-sm text-gray-600">Average processing time</div>
            <div className="text-xs text-gray-500">
              Industry Target: {benchmarks.industryStandards.leadTime.excellent}
              m • Competitor Avg: {benchmarks.competitorAverages.leadTime}m
            </div>
            <div
              className={`text-xs font-medium ${
                getBenchmarkStatus(
                  averageLeadTime,
                  benchmarks.industryStandards.leadTime,
                  true
                ).color
              }`}
            >
              {getBenchmarkStatus(
                averageLeadTime,
                benchmarks.industryStandards.leadTime,
                true
              ).status.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">
              {formatCurrency(averageOrderValue)} average
            </div>
            <div className="text-xs text-gray-500">
              Total value generated during session
            </div>
            <div className="text-xs font-medium text-purple-600">
              REVENUE TRACKING
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Factory className="w-8 h-8 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Utilization</h3>
          </div>
          <div className="space-y-2">
            <div
              className={`text-3xl font-bold ${
                getBenchmarkStatus(
                  averageUtilization,
                  benchmarks.industryStandards.utilizationRate
                ).color
              }`}
            >
              {averageUtilization.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              Average department utilization
            </div>
            <div className="text-xs text-gray-500">
              Industry Target:{" "}
              {benchmarks.industryStandards.utilizationRate.excellent}% •
              Competitor Avg: {benchmarks.competitorAverages.utilizationRate}%
            </div>
            <div
              className={`text-xs font-medium ${
                getBenchmarkStatus(
                  averageUtilization,
                  benchmarks.industryStandards.utilizationRate
                ).color
              }`}
            >
              {getBenchmarkStatus(
                averageUtilization,
                benchmarks.industryStandards.utilizationRate
              ).status.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Factory className="w-6 h-6 text-blue-500" />
          <span>Department Performance</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Utilization based on throughput and processing capacity throughout the
          session
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {departmentStats.map((dept, index) => {
            const sessionMinutes = Math.max(
              1,
              gameState.session.elapsedTime / (60 * 1000)
            );
            const processingRate = (
              (dept.processed / sessionMinutes) *
              60
            ).toFixed(1); // orders per hour

            return (
              <div
                key={index}
                className="border border-gray-100 rounded-lg p-4"
              >
                <h4 className="font-semibold text-gray-900 mb-2">
                  {dept.name}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Utilization:</span>
                    <span
                      className={`text-sm font-semibold ${
                        dept.utilization > 80
                          ? "text-red-600"
                          : dept.utilization > 60
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {dept.utilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Processed:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {dept.processed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rate:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {processingRate}/hr
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Queue:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {dept.queueLength}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Performance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Target className="w-6 h-6 text-red-500" />
          <span>Priority Performance</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {priorityStats.map((stat, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                {stat.priority}
              </h4>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">
                  {stat.rate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  {stat.onTime} of {stat.total} on time
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6">
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Opnieuw Spelen
        </button>
        <button
          onClick={exportToCSV}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>CSV Data</span>
        </button>
        <button
          onClick={exportDashboardHTML}
          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>HTML Dashboard</span>
        </button>
        <button
          onClick={() => setShowLegacyExportModal(true)}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Mail className="w-5 h-5" />
          <span>Mail naar Leraar</span>
        </button>
      </div>

      {/* New Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Legacy Export Modal */}
      {showLegacyExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Mail Resultaten naar Leraar
              </h3>
              <button
                onClick={() => setShowLegacyExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jouw Naam *
                </label>
                <input
                  type="text"
                  value={emailData.studentName}
                  onChange={(e) =>
                    setEmailData({ ...emailData, studentName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Voor- en achternaam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jouw Email
                </label>
                <input
                  type="email"
                  value={emailData.studentEmail}
                  onChange={(e) =>
                    setEmailData({ ...emailData, studentEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jouw.email@school.nl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leraar Email *
                </label>
                <input
                  type="email"
                  value={emailData.teacherEmail}
                  onChange={(e) =>
                    setEmailData({ ...emailData, teacherEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="leraar@school.nl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cursus/Vak
                </label>
                <input
                  type="text"
                  value={emailData.courseName}
                  onChange={(e) =>
                    setEmailData({ ...emailData, courseName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bedrijfskunde, Logistiek, etc."
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">
                  📧 <strong>Email bevat:</strong> Overzichtelijke samenvatting
                  met alle prestatie-indicatoren en benchmark vergelijkingen.
                  Voor visuele dashboard, gebruik de "HTML Dashboard" download
                  knop.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowLegacyExportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={() => {
                  exportDashboardHTML();
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Download Dashboard</span>
              </button>
              <button
                onClick={sendEmailToTeacher}
                disabled={!emailData.studentName || !emailData.teacherEmail}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Verstuur Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndGameScreen;

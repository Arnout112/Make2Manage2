import React, { useState } from "react";
import { Download, Mail, X } from "lucide-react";
import { useSharedGameState } from "../../contexts/GameStateContext";
import { formatCurrency } from "../../utils/formatters";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { gameState } = useSharedGameState();
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

  // Calculate session duration in minutes
  const sessionDuration = Math.round(
    gameState.session.elapsedTime / (60 * 1000)
  );
  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + order.orderValue,
    0
  );
  const averageOrderValue =
    completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Calculate department stats
  const departmentStats = gameState.departments.map((dept) => ({
    name: dept.name,
    utilization: dept.utilization,
    processed: dept.totalProcessed || 0,
    queueLength: dept.queue?.length || 0,
  }));

  const averageUtilization =
    departmentStats.length > 0
      ? departmentStats.reduce((sum, dept) => sum + dept.utilization, 0) /
        departmentStats.length
      : 0;

  // Priority stats calculation
  const priorityStats = ["urgent", "high", "normal", "low"].map((priority) => {
    const priorityOrders = completedOrders.filter(
      (order) => order.priority === priority
    );
    const priorityOnTime = priorityOrders.filter(
      (order) => order.status === "completed-on-time"
    );
    return {
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      total: priorityOrders.length,
      onTime: priorityOnTime.length,
      rate:
        priorityOrders.length > 0
          ? (priorityOnTime.length / priorityOrders.length) * 100
          : 0,
    };
  });

  // Benchmark data (simplified for this example)
  const benchmarks = {
    industryStandards: {
      onTimeDeliveryRate: { poor: 70, average: 85, excellent: 95 },
      leadTime: { poor: 20, average: 15, excellent: 10 },
      utilizationRate: { poor: 60, average: 75, excellent: 85 },
    },
    competitorAverages: {
      onTimeDeliveryRate: 82,
      leadTime: 16,
      utilizationRate: 72,
    },
  };

  const getBenchmarkStatus = (
    value: number,
    benchmark: any,
    isLowerBetter = false
  ) => {
    if (isLowerBetter) {
      if (value <= benchmark.excellent) return { status: "excellent" };
      if (value <= benchmark.average) return { status: "average" };
      return { status: "poor" };
    } else {
      if (value >= benchmark.excellent) return { status: "excellent" };
      if (value >= benchmark.average) return { status: "average" };
      return { status: "poor" };
    }
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
        .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
        .stat-label { font-size: 0.9rem; color: #6b7280; margin-bottom: 8px; }
        .stat-value { font-size: 2rem; font-weight: bold; margin-bottom: 8px; }
        .benchmark { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .benchmark.excellent { background: #dcfce7; color: #166534; }
        .benchmark.average { background: #fef3c7; color: #92400e; }
        .benchmark.poor { background: #fee2e2; color: #991b1b; }
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
                <div class="stat-value" style="color: #2563eb;">${onTimeRate.toFixed(
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
                <div class="stat-label">Gemiddelde Orderwaarde</div>
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
                    <td>${processingRate} orders/hr</td>
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
                    <th>Prioriteit</th>
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Export Resultaten
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Export Options */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-800 mb-3">
            Snelle Download
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>CSV Data</span>
            </button>
            <button
              onClick={exportDashboardHTML}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>HTML Dashboard</span>
            </button>
          </div>
        </div>

        {/* Email to Teacher Section */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Mail naar Leraar</span>
          </h4>

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
              </p>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuleren
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
    </div>
  );
};

export default ExportModal;

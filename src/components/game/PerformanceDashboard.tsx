import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Activity, AlertCircle, CheckCircle, Factory } from 'lucide-react'
import type { GameState } from '../types'

interface PerformanceDashboardProps {
  gameState: GameState
  benchmarkData?: BenchmarkData
  onExportMetrics?: () => void
}

interface BenchmarkData {
  industryStandards: {
    onTimeDeliveryRate: { poor: number; average: number; excellent: number }
    utilizationRate: { poor: number; average: number; excellent: number }
    leadTime: { poor: number; average: number; excellent: number }
    throughput: { poor: number; average: number; excellent: number }
    customerSatisfaction: { poor: number; average: number; excellent: number }
  }
  competitorAverages: {
    onTimeDeliveryRate: number
    utilizationRate: number
    leadTime: number
    throughput: number
    customerSatisfaction: number
  }
}

interface KPIMetric {
  id: string
  name: string
  value: number
  unit: string
  target: number
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  status: 'excellent' | 'good' | 'average' | 'poor' | 'critical'
  description: string
  recommendation?: string
}

interface PerformanceInsight {
  id: string
  type: 'opportunity' | 'warning' | 'success' | 'critical'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  recommendation?: string
}

export default function PerformanceDashboard({ gameState, benchmarkData, onExportMetrics }: PerformanceDashboardProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'trends' | 'benchmarks' | 'insights'>('overview')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'current' | 'last-hour' | 'session' | 'all-time'>('current')

  // Default benchmark data if not provided
  const defaultBenchmarks: BenchmarkData = {
    industryStandards: {
      onTimeDeliveryRate: { poor: 70, average: 85, excellent: 95 },
      utilizationRate: { poor: 50, average: 75, excellent: 85 },
      leadTime: { poor: 120, average: 60, excellent: 30 }, // minutes
      throughput: { poor: 5, average: 15, excellent: 25 }, // orders per hour
      customerSatisfaction: { poor: 70, average: 85, excellent: 95 }
    },
    competitorAverages: {
      onTimeDeliveryRate: 82,
      utilizationRate: 73,
      leadTime: 65,
      throughput: 12,
      customerSatisfaction: 81
    }
  }

  const benchmarks = benchmarkData || defaultBenchmarks

  // Calculate comprehensive KPI metrics
  const kpiMetrics = useMemo((): KPIMetric[] => {
    const completedOrders = gameState.completedOrders
    const totalOrders = gameState.totalOrdersGenerated
    const onTimeOrders = completedOrders.filter(o => o.status === 'completed-on-time').length
    const onTimeRate = completedOrders.length > 0 ? (onTimeOrders / completedOrders.length) * 100 : 0
    
    const avgUtilization = gameState.departments.length > 0 
      ? gameState.departments.reduce((sum, d) => sum + d.utilization, 0) / gameState.departments.length 
      : 0
    
    const avgLeadTime = completedOrders.length > 0 
      ? completedOrders.reduce((sum, o) => sum + (o.actualLeadTime || 0), 0) / completedOrders.length 
      : 0
    
    const sessionTimeHours = gameState.session.elapsedTime ? gameState.session.elapsedTime / (1000 * 60 * 60) : 1
    const throughputPerHour = totalOrders / Math.max(sessionTimeHours, 0.1)
    
    // Calculate customer satisfaction based on rush orders and priority handling
    const rushOrders = completedOrders.filter(o => o.rushOrder)
    const rushOnTime = rushOrders.filter(o => o.status === 'completed-on-time').length
    const customerSatisfaction = rushOrders.length > 0 ? (rushOnTime / rushOrders.length) * 100 : 85
    
    const getStatus = (value: number, thresholds: { poor: number; average: number; excellent: number }, reverse = false) => {
      if (reverse) {
        if (value <= thresholds.excellent) return 'excellent'
        if (value <= thresholds.average) return 'good'
        if (value <= thresholds.poor) return 'average'
        return 'poor'
      } else {
        if (value >= thresholds.excellent) return 'excellent'
        if (value >= thresholds.average) return 'good'
        if (value >= thresholds.poor) return 'average'
        return 'poor'
      }
    }

    return [
      {
        id: 'on-time-delivery',
        name: 'On-Time Delivery Rate',
        value: onTimeRate,
        unit: '%',
        target: benchmarks.industryStandards.onTimeDeliveryRate.excellent,
        trend: onTimeRate > benchmarks.competitorAverages.onTimeDeliveryRate ? 'up' : 'down',
        trendValue: Math.abs(onTimeRate - benchmarks.competitorAverages.onTimeDeliveryRate),
        status: getStatus(onTimeRate, benchmarks.industryStandards.onTimeDeliveryRate),
        description: 'Percentage of orders delivered on or before promised date',
        recommendation: onTimeRate < 85 ? 'Focus on improving production scheduling and capacity planning' : undefined
      },
      {
        id: 'resource-utilization',
        name: 'Resource Utilization',
        value: avgUtilization,
        unit: '%',
        target: benchmarks.industryStandards.utilizationRate.excellent,
        trend: avgUtilization > benchmarks.competitorAverages.utilizationRate ? 'up' : 'down',
        trendValue: Math.abs(avgUtilization - benchmarks.competitorAverages.utilizationRate),
        status: getStatus(avgUtilization, benchmarks.industryStandards.utilizationRate),
        description: 'Average utilization rate across all departments',
        recommendation: avgUtilization < 70 ? 'Consider workload rebalancing and capacity optimization' : 
                        avgUtilization > 90 ? 'High utilization detected - monitor for bottlenecks' : undefined
      },
      {
        id: 'lead-time',
        name: 'Average Lead Time',
        value: avgLeadTime,
        unit: 'min',
        target: benchmarks.industryStandards.leadTime.excellent,
        trend: avgLeadTime < benchmarks.competitorAverages.leadTime ? 'up' : 'down',
        trendValue: Math.abs(avgLeadTime - benchmarks.competitorAverages.leadTime),
        status: getStatus(avgLeadTime, benchmarks.industryStandards.leadTime, true),
        description: 'Average time from order receipt to completion',
        recommendation: avgLeadTime > 60 ? 'Optimize routing and reduce setup times' : undefined
      },
      {
        id: 'throughput',
        name: 'Throughput',
        value: throughputPerHour,
        unit: 'orders/hr',
        target: benchmarks.industryStandards.throughput.excellent,
        trend: throughputPerHour > benchmarks.competitorAverages.throughput ? 'up' : 'down',
        trendValue: Math.abs(throughputPerHour - benchmarks.competitorAverages.throughput),
        status: getStatus(throughputPerHour, benchmarks.industryStandards.throughput),
        description: 'Number of orders processed per hour',
        recommendation: throughputPerHour < 10 ? 'Increase processing efficiency and reduce bottlenecks' : undefined
      },
      {
        id: 'customer-satisfaction',
        name: 'Customer Satisfaction',
        value: customerSatisfaction,
        unit: '%',
        target: benchmarks.industryStandards.customerSatisfaction.excellent,
        trend: customerSatisfaction > benchmarks.competitorAverages.customerSatisfaction ? 'up' : 'down',
        trendValue: Math.abs(customerSatisfaction - benchmarks.competitorAverages.customerSatisfaction),
        status: getStatus(customerSatisfaction, benchmarks.industryStandards.customerSatisfaction),
        description: 'Customer satisfaction based on rush order performance',
        recommendation: customerSatisfaction < 80 ? 'Prioritize VIP customers and rush orders' : undefined
      }
    ]
  }, [gameState, benchmarks])

  // Generate performance insights
  const performanceInsights = useMemo((): PerformanceInsight[] => {
    const insights: PerformanceInsight[] = []
    const onTimeMetric = kpiMetrics.find(m => m.id === 'on-time-delivery')
    const utilizationMetric = kpiMetrics.find(m => m.id === 'resource-utilization')
    const leadTimeMetric = kpiMetrics.find(m => m.id === 'lead-time')
    const throughputMetric = kpiMetrics.find(m => m.id === 'throughput')

    // Critical performance issues
    if (onTimeMetric && onTimeMetric.status === 'poor') {
      insights.push({
        id: 'critical-delivery',
        type: 'critical',
        title: 'Critical Delivery Performance',
        description: `On-time delivery rate is only ${onTimeMetric.value.toFixed(1)}%, well below industry standards`,
        impact: 'high',
        actionable: true,
        recommendation: 'Immediate action needed: Review scheduling processes and capacity allocation'
      })
    }

    // Utilization opportunities
    if (utilizationMetric && utilizationMetric.value < 60) {
      insights.push({
        id: 'underutilization',
        type: 'opportunity',
        title: 'Resource Underutilization Opportunity',
        description: `Department utilization is only ${utilizationMetric.value.toFixed(1)}%, indicating potential for higher throughput`,
        impact: 'medium',
        actionable: true,
        recommendation: 'Consider workload rebalancing or accepting more orders'
      })
    }

    // Overutilization warning
    if (utilizationMetric && utilizationMetric.value > 90) {
      insights.push({
        id: 'overutilization',
        type: 'warning',
        title: 'High Utilization Risk',
        description: `Average utilization is ${utilizationMetric.value.toFixed(1)}%, which may lead to bottlenecks`,
        impact: 'medium',
        actionable: true,
        recommendation: 'Monitor for bottlenecks and consider capacity expansion'
      })
    }

    // Lead time efficiency
    if (leadTimeMetric && leadTimeMetric.status === 'excellent') {
      insights.push({
        id: 'excellent-leadtime',
        type: 'success',
        title: 'Excellent Lead Time Performance',
        description: `Average lead time of ${leadTimeMetric.value.toFixed(1)} minutes is industry-leading`,
        impact: 'high',
        actionable: false
      })
    }

    // Throughput achievements
    if (throughputMetric && throughputMetric.status === 'excellent') {
      insights.push({
        id: 'high-throughput',
        type: 'success',
        title: 'Outstanding Throughput Achievement',
        description: `Processing ${throughputMetric.value.toFixed(1)} orders per hour exceeds industry benchmarks`,
        impact: 'high',
        actionable: false
      })
    }

    // Bottleneck detection
    const bottleneckDept = gameState.departments.find(d => d.utilization > 95)
    if (bottleneckDept) {
      insights.push({
        id: 'bottleneck-detected',
        type: 'warning',
        title: 'Bottleneck Detected',
        description: `Department ${bottleneckDept.name} is at ${bottleneckDept.utilization.toFixed(1)}% utilization`,
        impact: 'high',
        actionable: true,
        recommendation: 'Consider redistributing workload or expanding capacity for this department'
      })
    }

    return insights
  }, [kpiMetrics, gameState])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 border-green-300'
      case 'good': return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'average': return 'text-yellow-600 bg-yellow-100 border-yellow-300'
      case 'poor': return 'text-orange-600 bg-orange-100 border-orange-300'
      case 'critical': return 'text-red-600 bg-red-100 border-red-300'
      default: return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="text-blue-600" size={20} />
      case 'warning': return <AlertCircle className="text-yellow-600" size={20} />
      case 'success': return <CheckCircle className="text-green-600" size={20} />
      case 'critical': return <AlertCircle className="text-red-600" size={20} />
      default: return <Activity className="text-gray-600" size={20} />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="text-green-600" size={16} />
      case 'down': return <TrendingDown className="text-red-600" size={16} />
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="text-blue-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-800">Performance Dashboard</h3>
          <span className="text-sm text-gray-500">R09-R11: Advanced Analytics & Benchmarking</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['overview', 'detailed', 'trends', 'benchmarks', 'insights'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  selectedView === view
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['current', 'last-hour', 'session', 'all-time'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {timeframe.replace('-', ' ')}
              </button>
            ))}
          </div>
          
          {onExportMetrics && (
            <button
              onClick={onExportMetrics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export Metrics
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-5 gap-4">
              {kpiMetrics.map(metric => (
                <div key={metric.id} className={`border-2 rounded-lg p-4 ${getStatusColor(metric.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {metric.value.toFixed(1)}{metric.unit}
                  </div>
                  <div className="text-xs opacity-80">
                    Target: {metric.target}{metric.unit}
                  </div>
                  <div className="text-xs opacity-80">
                    {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : '±'}{metric.trendValue.toFixed(1)}{metric.unit} vs competitors
                  </div>
                </div>
              ))}
            </div>

            {/* Department Performance Summary */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Department Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                {gameState.departments.map(dept => (
                  <div key={dept.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Factory size={20} className="text-gray-600" />
                        <span className="font-medium text-gray-800">{dept.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        dept.utilization > 90 ? 'bg-red-100 text-red-800' :
                        dept.utilization > 75 ? 'bg-yellow-100 text-yellow-800' :
                        dept.utilization > 50 ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {dept.utilization.toFixed(1)}% Util
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Queue</p>
                        <p className="font-semibold">{dept.queue.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Processed</p>
                        <p className="font-semibold">{dept.totalProcessed}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cycle Time</p>
                        <p className="font-semibold">{dept.avgCycleTime.toFixed(1)}m</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Utilization</span>
                        <span>{dept.utilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            dept.utilization > 90 ? 'bg-red-500' :
                            dept.utilization > 75 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(dept.utilization, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'benchmarks' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800">Industry Benchmarking</h4>
            
            <div className="space-y-4">
              {kpiMetrics.map(metric => (
                <div key={metric.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-semibold text-gray-800">{metric.name}</h5>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(metric.status)}`}>
                      {metric.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{metric.value.toFixed(1)}{metric.unit}</p>
                      <p className="text-sm text-gray-600">Your Performance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">
                        {metric.id === 'on-time-delivery' && benchmarks.competitorAverages.onTimeDeliveryRate.toFixed(1)}
                        {metric.id === 'resource-utilization' && benchmarks.competitorAverages.utilizationRate.toFixed(1)}
                        {metric.id === 'lead-time' && benchmarks.competitorAverages.leadTime.toFixed(1)}
                        {metric.id === 'throughput' && benchmarks.competitorAverages.throughput.toFixed(1)}
                        {metric.id === 'customer-satisfaction' && benchmarks.competitorAverages.customerSatisfaction.toFixed(1)}
                        {metric.unit}
                      </p>
                      <p className="text-sm text-gray-600">Competitor Average</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {metric.id === 'on-time-delivery' && benchmarks.industryStandards.onTimeDeliveryRate.average}
                        {metric.id === 'resource-utilization' && benchmarks.industryStandards.utilizationRate.average}
                        {metric.id === 'lead-time' && benchmarks.industryStandards.leadTime.average}
                        {metric.id === 'throughput' && benchmarks.industryStandards.throughput.average}
                        {metric.id === 'customer-satisfaction' && benchmarks.industryStandards.customerSatisfaction.average}
                        {metric.unit}
                      </p>
                      <p className="text-sm text-gray-600">Industry Average</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{metric.target}{metric.unit}</p>
                      <p className="text-sm text-gray-600">Excellence Target</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
                    </div>
                    
                    {/* Position marker for current performance */}
                    <div 
                      className="absolute top-0 w-3 h-3 bg-blue-600 rounded-full transform -translate-x-1/2 border-2 border-white shadow-lg"
                      style={{ 
                        left: `${Math.min(Math.max((metric.value / metric.target) * 100, 5), 95)}%` 
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Poor</span>
                    <span>Average</span>
                    <span>Excellent</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'insights' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800">Performance Insights</h4>
            
            <div className="space-y-4">
              {performanceInsights.map(insight => (
                <div key={insight.id} className={`border-l-4 rounded-lg p-4 ${
                  insight.type === 'critical' ? 'border-red-500 bg-red-50' :
                  insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  insight.type === 'opportunity' ? 'border-blue-500 bg-blue-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h5 className="font-semibold text-gray-800">{insight.title}</h5>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                          insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {insight.impact.toUpperCase()} IMPACT
                        </span>
                        {insight.actionable && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            ACTIONABLE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{insight.description}</p>
                  
                  {insight.recommendation && (
                    <div className="bg-white bg-opacity-60 rounded p-3">
                      <p className="text-sm font-medium text-gray-800">Recommendation:</p>
                      <p className="text-sm text-gray-700">{insight.recommendation}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {performanceInsights.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No critical insights at this time</p>
                  <p className="text-sm">Your performance is tracking well across all metrics.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

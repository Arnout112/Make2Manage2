import { useState, useMemo } from 'react'
import { BarChart3, Clock, TrendingUp, AlertTriangle, CheckCircle, Users, Zap } from 'lucide-react'
import type { GameState } from '../types'

interface CapacityPlannerProps {
  gameState: GameState
  onScheduleOrder?: (orderId: string, departmentId: number, scheduledTime: Date) => void
  onRebalanceWorkload?: (rebalancingPlan: WorkloadRebalancingPlan) => void
}

interface DepartmentCapacity {
  id: number
  name: string
  currentUtilization: number
  maxCapacity: number
  availableCapacity: number
  queueLength: number
  avgProcessingTime: number
  efficiency: number
  bottleneckRisk: 'low' | 'medium' | 'high'
  predictedUtilization: number // Next hour prediction
  optimalLoad: number // Calculated optimal load
}

interface WorkloadRebalancingPlan {
  sourceIds: number[]
  targetIds: number[]
  ordersToMove: string[]
  expectedImprovements: {
    reducedBottlenecks: number
    improvedEfficiency: number
    balancedUtilization: number
  }
}

interface SchedulingRecommendation {
  orderId: string
  recommendedDepartment: number
  alternativeDepartments: number[]
  scheduledTime: Date
  reasoning: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export default function CapacityPlanner({ gameState, onScheduleOrder, onRebalanceWorkload }: CapacityPlannerProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '4h' | '8h' | '24h'>('4h')
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null)

  // Calculate department capacity metrics
  const departmentCapacities = useMemo((): DepartmentCapacity[] => {
    return gameState.departments.map(dept => {
      const currentLoad = dept.queue.length + (dept.inProcess ? 1 : 0)
      const maxCapacity = dept.capacity || 5
      const currentUtilization = (currentLoad / maxCapacity) * 100
      const availableCapacity = Math.max(0, maxCapacity - currentLoad)
      
      // Predict utilization based on queue and processing times
      const avgProcessingTime = dept.standardProcessingTime || 30
      const queueProcessingTime = dept.queue.reduce((total, order) => {
        return total + (order.processingTime || avgProcessingTime)
      }, 0)
      
      const predictedUtilization = Math.min(100, currentUtilization + (queueProcessingTime / (maxCapacity * 60)) * 100)
      
      // Calculate optimal load (75-85% utilization is typically optimal)
      const optimalLoad = Math.ceil(maxCapacity * 0.8)
      
      // Determine bottleneck risk
      let bottleneckRisk: 'low' | 'medium' | 'high' = 'low'
      if (currentUtilization > 90) bottleneckRisk = 'high'
      else if (currentUtilization > 75) bottleneckRisk = 'medium'
      
      return {
        id: dept.id,
        name: dept.name,
        currentUtilization,
        maxCapacity,
        availableCapacity,
        queueLength: dept.queue.length,
        avgProcessingTime: dept.standardProcessingTime,
        efficiency: dept.efficiency,
        bottleneckRisk,
        predictedUtilization,
        optimalLoad
      }
    })
  }, [gameState.departments])

  // Generate scheduling recommendations
  const schedulingRecommendations = useMemo((): SchedulingRecommendation[] => {
    const recommendations: SchedulingRecommendation[] = []
    const now = new Date()
    
    gameState.pendingOrders.slice(0, 5).forEach(order => {
      const reasoning: string[] = []
      
      // Find the best department for the first step in the route
      const firstStepDept = order.route[0]
      const targetDept = departmentCapacities.find(d => d.id === firstStepDept)
      
      if (!targetDept) return
      
      // Calculate scheduling priority
      let priority: 'low' | 'medium' | 'high' | 'urgent' = order.priority === 'normal' ? 'medium' : order.priority as 'low' | 'high' | 'urgent'
      
      // Check if order should be prioritized due to due date
      const timeUntilDue = order.dueDate.getTime() - now.getTime()
      const hoursUntilDue = timeUntilDue / (1000 * 60 * 60)
      
      if (hoursUntilDue < 2 && priority !== 'urgent') {
        priority = 'urgent'
        reasoning.push('Due date approaching - escalated to urgent')
      }
      
      // Find alternative departments with similar capabilities
      const alternativeDepartments = departmentCapacities
        .filter(d => d.id !== firstStepDept && d.availableCapacity > 0)
        .sort((a, b) => a.currentUtilization - b.currentUtilization)
        .slice(0, 2)
        .map(d => d.id)
      
      // Calculate optimal scheduling time
      const estimatedWaitTime = targetDept.queueLength * (targetDept.avgProcessingTime * 60 * 1000) // Convert to ms
      const scheduledTime = new Date(now.getTime() + estimatedWaitTime)
      
      // Add reasoning based on department status
      if (targetDept.bottleneckRisk === 'high') {
        reasoning.push(`${targetDept.name} is overloaded - consider alternatives`)
        if (alternativeDepartments.length > 0) {
          const altDept = departmentCapacities.find(d => d.id === alternativeDepartments[0])
          reasoning.push(`Alternative: ${altDept?.name} has ${altDept?.availableCapacity} available capacity`)
        }
      } else if (targetDept.bottleneckRisk === 'medium') {
        reasoning.push(`${targetDept.name} is busy but manageable`)
      } else {
        reasoning.push(`${targetDept.name} has good availability`)
      }
      
      // Add efficiency considerations
      if (targetDept.efficiency > 1.1) {
        reasoning.push('High efficiency department - good performance expected')
      } else if (targetDept.efficiency < 0.9) {
        reasoning.push('Lower efficiency department - may take longer than standard')
      }
      
      recommendations.push({
        orderId: order.id,
        recommendedDepartment: firstStepDept,
        alternativeDepartments,
        scheduledTime,
        reasoning,
        priority
      })
    })
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [gameState.pendingOrders, departmentCapacities])

  // Generate workload rebalancing recommendations
  const workloadRebalancing = useMemo((): WorkloadRebalancingPlan | null => {
    const overloadedDepts = departmentCapacities.filter(d => d.currentUtilization > 85)
    const underloadedDepts = departmentCapacities.filter(d => d.currentUtilization < 50 && d.availableCapacity > 0)
    
    if (overloadedDepts.length === 0 || underloadedDepts.length === 0) return null
    
    const ordersToMove: string[] = []
    const sourceIds = overloadedDepts.map(d => d.id)
    const targetIds = underloadedDepts.map(d => d.id)
    
    // Find orders that could be moved (in queue, not yet processing)
    overloadedDepts.forEach(dept => {
      const deptOrders = gameState.departments.find(d => d.id === dept.id)?.queue.slice(-2) || []
      ordersToMove.push(...deptOrders.map(o => o.id))
    })
    
    return {
      sourceIds,
      targetIds,
      ordersToMove: ordersToMove.slice(0, 3), // Limit to 3 orders
      expectedImprovements: {
        reducedBottlenecks: overloadedDepts.length,
        improvedEfficiency: 15, // Estimated 15% improvement
        balancedUtilization: (departmentCapacities.reduce((sum, d) => sum + d.currentUtilization, 0) / departmentCapacities.length)
      }
    }
  }, [departmentCapacities, gameState.departments])

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 90) return 'bg-red-500'
    if (utilization > 75) return 'bg-yellow-500'
    if (utilization > 50) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getBottleneckColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-blue-600 bg-blue-100'
      case 'low': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="text-blue-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-800">Capacity Planner</h3>
          <span className="text-sm text-gray-500">R04-R05: Order Scheduling & Capacity</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Timeframe:</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
              <option value="8h">8 Hours</option>
              <option value="24h">24 Hours</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Department Capacity Overview */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Department Capacity Overview</h4>
          <div className="grid grid-cols-2 gap-4">
            {departmentCapacities.map(dept => (
              <div
                key={dept.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedDepartment === dept.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedDepartment(selectedDepartment === dept.id ? null : dept.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-800">{dept.name}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBottleneckColor(dept.bottleneckRisk)}`}>
                    {dept.bottleneckRisk.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Current Load</span>
                      <span>{dept.currentUtilization.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getUtilizationColor(dept.currentUtilization)}`}
                        style={{ width: `${Math.min(dept.currentUtilization, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Queue:</span>
                      <p className="font-medium">{dept.queueLength}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <p className="font-medium">{dept.availableCapacity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Efficiency:</span>
                      <p className="font-medium">{dept.efficiency.toFixed(2)}x</p>
                    </div>
                  </div>
                  
                  {showAdvancedMetrics && (
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Predicted:</span>
                          <p className="font-medium">{dept.predictedUtilization.toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Optimal:</span>
                          <p className="font-medium">{dept.optimalLoad} units</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduling Recommendations */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Scheduling Recommendations</h4>
          <div className="space-y-3">
            {schedulingRecommendations.map(rec => (
              <div key={rec.orderId} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium">{rec.orderId}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-600" />
                    <span className="text-sm text-gray-600">{formatTime(rec.scheduledTime)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Recommended Department:</p>
                    <p className="text-sm text-blue-600">
                      {departmentCapacities.find(d => d.id === rec.recommendedDepartment)?.name}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Alternatives:</p>
                    <p className="text-sm text-gray-600">
                      {rec.alternativeDepartments.map(id => 
                        departmentCapacities.find(d => d.id === id)?.name
                      ).join(', ') || 'None available'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Reasoning:</p>
                  <ul className="text-sm text-gray-600">
                    {rec.reasoning.map((reason, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <CheckCircle size={12} className="text-green-600" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {onScheduleOrder && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => onScheduleOrder(rec.orderId, rec.recommendedDepartment, rec.scheduledTime)}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Apply Schedule
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Workload Rebalancing */}
        {workloadRebalancing && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Workload Rebalancing Opportunity</h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={20} className="text-yellow-600" />
                <span className="font-medium text-yellow-800">Optimization Opportunity Detected</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Overloaded Departments:</p>
                  <div className="space-y-1">
                    {workloadRebalancing.sourceIds.map(id => {
                      const dept = departmentCapacities.find(d => d.id === id)
                      return (
                        <div key={id} className="text-sm text-red-600">
                          {dept?.name} ({dept?.currentUtilization.toFixed(1)}%)
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Available Capacity:</p>
                  <div className="space-y-1">
                    {workloadRebalancing.targetIds.map(id => {
                      const dept = departmentCapacities.find(d => d.id === id)
                      return (
                        <div key={id} className="text-sm text-green-600">
                          {dept?.name} ({dept?.availableCapacity} available)
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded p-3 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Expected Improvements:</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      -{workloadRebalancing.expectedImprovements.reducedBottlenecks}
                    </div>
                    <div className="text-gray-600">Bottlenecks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      +{workloadRebalancing.expectedImprovements.improvedEfficiency}%
                    </div>
                    <div className="text-gray-600">Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {workloadRebalancing.expectedImprovements.balancedUtilization.toFixed(1)}%
                    </div>
                    <div className="text-gray-600">Avg Utilization</div>
                  </div>
                </div>
              </div>
              
              {onRebalanceWorkload && (
                <div className="flex justify-end">
                  <button
                    onClick={() => onRebalanceWorkload(workloadRebalancing)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  >
                    <Zap size={16} />
                    Apply Rebalancing
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Capacity Summary</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(departmentCapacities.reduce((sum, d) => sum + d.currentUtilization, 0) / departmentCapacities.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg Utilization</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {departmentCapacities.reduce((sum, d) => sum + d.availableCapacity, 0)}
              </div>
              <div className="text-sm text-gray-600">Available Capacity</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {departmentCapacities.filter(d => d.bottleneckRisk === 'high').length}
              </div>
              <div className="text-sm text-gray-600">Bottlenecks</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {(departmentCapacities.reduce((sum, d) => sum + d.efficiency, 0) / departmentCapacities.length).toFixed(2)}x
              </div>
              <div className="text-sm text-gray-600">Avg Efficiency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

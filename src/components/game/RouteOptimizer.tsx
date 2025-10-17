import { useState, useMemo } from 'react'
import { Route, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Zap } from 'lucide-react'
import type { Order, Department } from '../types'

interface RouteOptimizerProps {
  orders: Order[]
  departments: Department[]
  onOptimizeRoute?: (orderId: string, newRoute: number[]) => void
  onSelectAlternativeRoute?: (orderId: string, routeIndex: number) => void
}

interface RouteOption {
  route: number[]
  estimatedTime: number
  cost: number
  utilization: number
  riskLevel: 'low' | 'medium' | 'high'
  bottleneckDepartments: number[]
  efficiency: number
}

interface RouteAnalysis {
  originalRoute: RouteOption
  alternativeRoutes: RouteOption[]
  recommendation: 'keep-original' | 'use-alternative' | 'optimize-further'
  reasoning: string[]
}

export default function RouteOptimizer({ orders, departments, onSelectAlternativeRoute }: RouteOptimizerProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false)

  // Calculate department load and availability
  const departmentMetrics = useMemo(() => {
    return departments.reduce((acc, dept) => {
      const queueLength = dept.queue.length
      const avgProcessingTime = dept.standardProcessingTime
      const utilization = dept.utilization / 100
      const efficiency = dept.efficiency
      const condition = dept.equipmentCondition
      
      acc[dept.id] = {
        queueLength,
        avgProcessingTime,
        utilization,
        efficiency,
        condition,
        availabilityScore: (1 - utilization) * efficiency * condition,
        riskScore: utilization > 0.8 ? 'high' : utilization > 0.6 ? 'medium' : 'low'
      }
      
      return acc
    }, {} as Record<number, any>)
  }, [departments])

  // Generate alternative routes for an order
  const generateAlternativeRoutes = (originalRoute: number[]): RouteOption[] => {
    const alternatives: RouteOption[] = []
    
    // Strategy 1: Parallel processing optimization
    if (originalRoute.length > 3) {
      const parallelRoute = optimizeForParallelProcessing(originalRoute)
      if (parallelRoute.length !== originalRoute.length || !arraysEqual(parallelRoute, originalRoute)) {
        alternatives.push(analyzeRoute(parallelRoute))
      }
    }
    
    // Strategy 2: Load balancing optimization
    const loadBalancedRoute = optimizeForLoadBalancing(originalRoute)
    if (!arraysEqual(loadBalancedRoute, originalRoute)) {
      alternatives.push(analyzeRoute(loadBalancedRoute))
    }
    
    // Strategy 3: Shortest path optimization
    const shortestRoute = optimizeForShortestPath(originalRoute)
    if (shortestRoute.length < originalRoute.length) {
      alternatives.push(analyzeRoute(shortestRoute))
    }
    
    // Strategy 4: Risk mitigation optimization
    const riskMitigatedRoute = optimizeForRiskMitigation(originalRoute)
    if (!arraysEqual(riskMitigatedRoute, originalRoute)) {
      alternatives.push(analyzeRoute(riskMitigatedRoute))
    }
    
    return alternatives.slice(0, 3) // Limit to top 3 alternatives
  }

  const optimizeForParallelProcessing = (route: number[]): number[] => {
    // Group consecutive operations that can be done in parallel
    const optimized = [...route]
    
    // If we have consecutive departments with overlapping capabilities, reorder for efficiency
    for (let i = 0; i < optimized.length - 1; i++) {
      const current = optimized[i]
      const next = optimized[i + 1]
      
      // Check if we can swap for better parallel processing
      if (departmentMetrics[current]?.utilization > departmentMetrics[next]?.utilization + 0.2) {
        // Swap if current department is significantly more loaded
        [optimized[i], optimized[i + 1]] = [optimized[i + 1], optimized[i]]
      }
    }
    
    return optimized
  }

  const optimizeForLoadBalancing = (route: number[]): number[] => {
    // Replace heavily loaded departments with alternatives where possible
    return route.map(deptId => {
      const deptMetric = departmentMetrics[deptId]
      if (deptMetric?.utilization > 0.8) {
        // Find alternative department with similar capabilities but lower load
        const alternatives = departments.filter(d => 
          d.id !== deptId && 
          departmentMetrics[d.id]?.utilization < 0.6 &&
          d.operations.some(op => departments.find(orig => orig.id === deptId)?.operations.some(origOp => 
            op.name.includes(origOp.name.split(' ')[0]) || origOp.name.includes(op.name.split(' ')[0])
          ))
        )
        
        if (alternatives.length > 0) {
          // Return the department with best availability score
          return alternatives.reduce((best, current) => 
            departmentMetrics[current.id].availabilityScore > departmentMetrics[best.id].availabilityScore ? current : best
          ).id
        }
      }
      return deptId
    })
  }

  const optimizeForShortestPath = (route: number[]): number[] => {
    // Remove redundant steps or consolidate operations
    const optimized: number[] = []
    const visited = new Set()
    
    for (const deptId of route) {
      // Skip if we've just been to this department and can combine operations
      if (!visited.has(deptId) || optimized[optimized.length - 1] !== deptId) {
        optimized.push(deptId)
        visited.add(deptId)
      }
    }
    
    return optimized
  }

  const optimizeForRiskMitigation = (route: number[]): number[] => {
    // Avoid high-risk departments or add redundancy for critical operations
    return route.map(deptId => {
      const riskLevel = departmentMetrics[deptId]?.riskScore
      if (riskLevel === 'high') {
        // Find lower-risk alternative
        const alternatives = departments.filter(d => 
          d.id !== deptId && 
          departmentMetrics[d.id]?.riskScore !== 'high' &&
          d.operations.length > 0
        )
        
        if (alternatives.length > 0) {
          return alternatives.reduce((best, current) => 
            departmentMetrics[current.id].riskScore === 'low' ? current : best
          ).id
        }
      }
      return deptId
    })
  }

  const analyzeRoute = (route: number[]): RouteOption => {
    let totalTime = 0
    let totalCost = 0
    let avgUtilization = 0
    let riskScore = 0
    const bottlenecks: number[] = []
    
    route.forEach(deptId => {
      const metrics = departmentMetrics[deptId]
      if (metrics) {
        totalTime += metrics.avgProcessingTime + (metrics.queueLength * 5) // Queue delay
        totalCost += metrics.avgProcessingTime * 2.5 // Cost per minute
        avgUtilization += metrics.utilization
        
        if (metrics.utilization > 0.8) {
          bottlenecks.push(deptId)
          riskScore += 2
        } else if (metrics.utilization > 0.6) {
          riskScore += 1
        }
      }
    })
    
    avgUtilization /= route.length
    const efficiency = route.reduce((acc, deptId) => acc + (departmentMetrics[deptId]?.efficiency || 1), 0) / route.length
    
    return {
      route,
      estimatedTime: totalTime,
      cost: Math.round(totalCost),
      utilization: avgUtilization,
      riskLevel: riskScore > 4 ? 'high' : riskScore > 2 ? 'medium' : 'low',
      bottleneckDepartments: bottlenecks,
      efficiency
    }
  }

  const analyzeOrderRoute = (order: Order): RouteAnalysis => {
    const originalOption = analyzeRoute(order.route)
    const alternatives = generateAlternativeRoutes(order.route)
    
    // Determine recommendation
    let recommendation: RouteAnalysis['recommendation'] = 'keep-original'
    const reasoning: string[] = []
    
    const bestAlternative = alternatives.reduce((best, current) => {
      const bestScore = (best.efficiency * 0.4) + ((100 - best.utilization) * 0.3) + (best.estimatedTime > 0 ? (1000 / best.estimatedTime) * 0.3 : 0)
      const currentScore = (current.efficiency * 0.4) + ((100 - current.utilization) * 0.3) + (current.estimatedTime > 0 ? (1000 / current.estimatedTime) * 0.3 : 0)
      return currentScore > bestScore ? current : best
    }, alternatives[0])
    
    if (bestAlternative) {
      const timeSaving = originalOption.estimatedTime - bestAlternative.estimatedTime
      const costSaving = originalOption.cost - bestAlternative.cost
      const riskReduction = originalOption.riskLevel !== 'low' && bestAlternative.riskLevel === 'low'
      
      if (timeSaving > 10 || costSaving > 50 || riskReduction) {
        recommendation = 'use-alternative'
        if (timeSaving > 10) reasoning.push(`Saves ${timeSaving.toFixed(1)} minutes processing time`)
        if (costSaving > 50) reasoning.push(`Reduces costs by $${costSaving}`)
        if (riskReduction) reasoning.push('Reduces operational risk')
      }
    }
    
    if (originalOption.bottleneckDepartments.length > 0) {
      reasoning.push(`Bottlenecks detected in departments: ${originalOption.bottleneckDepartments.join(', ')}`)
      if (recommendation === 'keep-original') {
        recommendation = 'optimize-further'
      }
    }
    
    return {
      originalRoute: originalOption,
      alternativeRoutes: alternatives,
      recommendation,
      reasoning
    }
  }

  const arraysEqual = (a: number[], b: number[]): boolean => {
    return a.length === b.length && a.every((val, i) => val === b[i])
  }

  const selectedOrder = orders.find(o => o.id === selectedOrderId)
  const routeAnalysis = selectedOrder ? analyzeOrderRoute(selectedOrder) : null

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'keep-original': return <CheckCircle className="text-green-600" size={20} />
      case 'use-alternative': return <TrendingUp className="text-blue-600" size={20} />
      case 'optimize-further': return <AlertTriangle className="text-yellow-600" size={20} />
      default: return <Route className="text-gray-600" size={20} />
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Route className="text-blue-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-800">Route Optimizer</h3>
          <span className="text-sm text-gray-500">R06: Advanced Routing Logic</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Order to Optimize</label>
            <select 
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Choose an order...</option>
              {orders.filter(o => o.status === 'queued' || o.status === 'processing').map(order => (
                <option key={order.id} value={order.id}>
                  {order.id} - {order.customerName} ({order.priority})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setShowAdvancedAnalysis(!showAdvancedAnalysis)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              {showAdvancedAnalysis ? 'Hide' : 'Show'} Advanced Analysis
            </button>
          </div>
        </div>
      </div>

      {routeAnalysis && (
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {getRecommendationIcon(routeAnalysis.recommendation)}
              <h4 className="text-lg font-semibold text-gray-800">Route Analysis for {selectedOrder?.id}</h4>
            </div>
            
            {routeAnalysis.reasoning.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-blue-900 mb-2">Optimization Insights:</h5>
                <ul className="space-y-1">
                  {routeAnalysis.reasoning.map((reason, index) => (
                    <li key={index} className="text-blue-800 text-sm flex items-center gap-2">
                      <ArrowRight size={14} />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Original Route */}
          <div className="mb-6">
            <h5 className="font-medium text-gray-800 mb-3">Current Route</h5>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="font-mono text-lg">
                  {routeAnalysis.originalRoute.route.join(' → ')}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(routeAnalysis.originalRoute.riskLevel)}`}>
                  {routeAnalysis.originalRoute.riskLevel.toUpperCase()} RISK
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Est. Time:</span>
                  <p className="font-medium">{routeAnalysis.originalRoute.estimatedTime.toFixed(1)}m</p>
                </div>
                <div>
                  <span className="text-gray-600">Est. Cost:</span>
                  <p className="font-medium">${routeAnalysis.originalRoute.cost}</p>
                </div>
                <div>
                  <span className="text-gray-600">Avg. Utilization:</span>
                  <p className="font-medium">{routeAnalysis.originalRoute.utilization.toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-gray-600">Efficiency:</span>
                  <p className="font-medium">{routeAnalysis.originalRoute.efficiency.toFixed(2)}x</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Routes */}
          {routeAnalysis.alternativeRoutes.length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-800 mb-3">Alternative Routes</h5>
              <div className="space-y-3">
                {routeAnalysis.alternativeRoutes.map((alt, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-lg">
                          {alt.route.join(' → ')}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(alt.riskLevel)}`}>
                          {alt.riskLevel.toUpperCase()} RISK
                        </span>
                        {alt.estimatedTime < routeAnalysis.originalRoute.estimatedTime && (
                          <span className="text-green-600 text-sm flex items-center gap-1">
                            <Zap size={14} />
                            Faster
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => onSelectAlternativeRoute?.(selectedOrderId, index)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Use This Route
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Est. Time:</span>
                        <p className="font-medium">{alt.estimatedTime.toFixed(1)}m</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Est. Cost:</span>
                        <p className="font-medium">${alt.cost}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg. Utilization:</span>
                        <p className="font-medium">{alt.utilization.toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Efficiency:</span>
                        <p className="font-medium">{alt.efficiency.toFixed(2)}x</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Analysis */}
          {showAdvancedAnalysis && (
            <div className="border-t border-gray-200 pt-6">
              <h5 className="font-medium text-gray-800 mb-4">Department Analysis</h5>
              <div className="grid grid-cols-2 gap-4">
                {departments.map(dept => {
                  const metrics = departmentMetrics[dept.id]
                  if (!metrics) return null
                  
                  return (
                    <div key={dept.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="font-medium text-gray-800">{dept.name}</h6>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(metrics.riskScore)}`}>
                          {metrics.riskScore.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Queue:</span>
                          <p className="font-medium">{metrics.queueLength}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Utilization:</span>
                          <p className="font-medium">{(metrics.utilization * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Efficiency:</span>
                          <p className="font-medium">{metrics.efficiency.toFixed(2)}x</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Condition:</span>
                          <p className="font-medium">{(metrics.condition * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedOrderId && (
        <div className="p-6 text-center text-gray-500">
          <Route size={48} className="mx-auto mb-4 opacity-50" />
          <p>Select an order above to analyze and optimize its routing</p>
        </div>
      )}
    </div>
  )
}

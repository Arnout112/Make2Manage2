import type { Department } from '../types'
import { SeededRandom } from './gameInitialization'

export interface RouteGenerationOptions {
  complexityLevel: string
  prioritizeSpeed?: boolean
  prioritizeCost?: boolean
  prioritizeReliability?: boolean
  avoidBottlenecks?: boolean
  customerTier?: 'standard' | 'premium' | 'vip'
  orderPriority?: 'low' | 'normal' | 'high' | 'urgent'
}

export interface DepartmentPathNode {
  id: number
  name: string
  operations: string[]
  avgProcessingTime: number
  utilization: number
  reliability: number
  cost: number
}

export interface RouteMetrics {
  totalTime: number
  totalCost: number
  reliability: number
  bottleneckRisk: number
  flexibilityScore: number
}

// Advanced route generation with multiple optimization strategies
export const generateOptimizedRoute = (
  rng: SeededRandom, 
  departments: Department[], 
  options: RouteGenerationOptions
): number[] => {
  const departmentNodes = departments.map(dept => ({
    id: dept.id,
    name: dept.name,
    operations: dept.operations.map(op => op.name),
    avgProcessingTime: dept.standardProcessingTime,
    utilization: dept.utilization,
    reliability: dept.equipmentCondition,
    cost: dept.standardProcessingTime * 2.5 // Cost per minute
  }))

  // Define required process flows for manufacturing
  const processFlows = getProcessFlowTemplates(options.complexityLevel)
  const selectedFlow = rng.choice(processFlows)
  
  // Generate base route from process flow
  let baseRoute = generateBaseRoute(selectedFlow, departmentNodes, rng)
  
  // Apply optimization strategies based on options
  if (options.prioritizeSpeed) {
    baseRoute = optimizeForSpeed(baseRoute, departmentNodes)
  }
  
  if (options.prioritizeCost) {
    baseRoute = optimizeForCost(baseRoute, departmentNodes)
  }
  
  if (options.prioritizeReliability) {
    baseRoute = optimizeForReliability(baseRoute, departmentNodes)
  }
  
  if (options.avoidBottlenecks) {
    baseRoute = avoidBottleneckDepartments(baseRoute, departmentNodes)
  }
  
  // Apply customer tier and priority adjustments
  if (options.customerTier === 'vip' || options.orderPriority === 'urgent') {
    baseRoute = addPriorityRouting(baseRoute, departmentNodes)
  }
  
  return baseRoute
}

// Process flow templates for different manufacturing scenarios
const getProcessFlowTemplates = (complexityLevel: string): string[][] => {
  switch (complexityLevel) {
    case 'beginner':
      return [
        ['prep', 'assembly', 'quality'],
        ['cutting', 'assembly', 'packaging'],
        ['prep', 'quality', 'packaging']
      ]
    case 'intermediate':
      return [
        ['cutting', 'prep', 'assembly', 'quality', 'packaging'],
        ['prep', 'cutting', 'assembly', 'assembly', 'quality'],
        ['cutting', 'assembly', 'quality', 'assembly', 'packaging'],
        ['prep', 'assembly', 'quality', 'packaging', 'quality']
      ]
    case 'advanced':
      return [
        ['cutting', 'prep', 'assembly', 'quality', 'assembly', 'quality', 'packaging'],
        ['prep', 'cutting', 'assembly', 'assembly', 'quality', 'assembly', 'packaging'],
        ['cutting', 'prep', 'assembly', 'quality', 'assembly', 'quality', 'assembly', 'packaging'],
        ['prep', 'cutting', 'assembly', 'quality', 'prep', 'assembly', 'quality', 'packaging']
      ]
    default:
      return [['cutting', 'assembly', 'quality', 'packaging']]
  }
}

// Generate base route from process flow template
const generateBaseRoute = (
  processFlow: string[], 
  departments: DepartmentPathNode[], 
  rng: SeededRandom
): number[] => {
  const route: number[] = []
  
  for (const requiredOperation of processFlow) {
    // Find departments that can perform this operation
    const capableDepartments = departments.filter(dept => 
      dept.operations.some(op => 
        op.toLowerCase().includes(requiredOperation.toLowerCase()) ||
        requiredOperation.toLowerCase().includes(op.toLowerCase().split(' ')[0])
      )
    )
    
    if (capableDepartments.length > 0) {
      // Choose based on availability and capability
      const selectedDept = rng.choice(capableDepartments)
      route.push(selectedDept.id)
    } else {
      // Fallback to any department
      const fallbackDept = rng.choice(departments)
      route.push(fallbackDept.id)
    }
  }
  
  return route
}

// Speed optimization - minimize total processing time
const optimizeForSpeed = (route: number[], departments: DepartmentPathNode[]): number[] => {
  const deptMap = departments.reduce((acc, dept) => {
    acc[dept.id] = dept
    return acc
  }, {} as Record<number, DepartmentPathNode>)
  
  // Replace slow departments with faster alternatives where possible
  return route.map(deptId => {
    const currentDept = deptMap[deptId]
    if (!currentDept) return deptId
    
    // Find faster departments with similar operations
    const alternatives = departments.filter(dept => 
      dept.id !== deptId &&
      dept.avgProcessingTime < currentDept.avgProcessingTime &&
      dept.operations.some(op => currentDept.operations.includes(op))
    )
    
    if (alternatives.length > 0) {
      // Choose the fastest available alternative
      const fastest = alternatives.reduce((best, current) => 
        current.avgProcessingTime < best.avgProcessingTime ? current : best
      )
      return fastest.id
    }
    
    return deptId
  })
}

// Cost optimization - minimize total processing cost
const optimizeForCost = (route: number[], departments: DepartmentPathNode[]): number[] => {
  const deptMap = departments.reduce((acc, dept) => {
    acc[dept.id] = dept
    return acc
  }, {} as Record<number, DepartmentPathNode>)
  
  return route.map(deptId => {
    const currentDept = deptMap[deptId]
    if (!currentDept) return deptId
    
    // Find cheaper departments with similar capabilities
    const alternatives = departments.filter(dept => 
      dept.id !== deptId &&
      dept.cost < currentDept.cost &&
      dept.operations.some(op => currentDept.operations.includes(op))
    )
    
    if (alternatives.length > 0) {
      const cheapest = alternatives.reduce((best, current) => 
        current.cost < best.cost ? current : best
      )
      return cheapest.id
    }
    
    return deptId
  })
}

// Reliability optimization - use most reliable departments
const optimizeForReliability = (route: number[], departments: DepartmentPathNode[]): number[] => {
  const deptMap = departments.reduce((acc, dept) => {
    acc[dept.id] = dept
    return acc
  }, {} as Record<number, DepartmentPathNode>)
  
  return route.map(deptId => {
    const currentDept = deptMap[deptId]
    if (!currentDept) return deptId
    
    // Find more reliable departments
    const alternatives = departments.filter(dept => 
      dept.id !== deptId &&
      dept.reliability > currentDept.reliability &&
      dept.operations.some(op => currentDept.operations.includes(op))
    )
    
    if (alternatives.length > 0) {
      const mostReliable = alternatives.reduce((best, current) => 
        current.reliability > best.reliability ? current : best
      )
      return mostReliable.id
    }
    
    return deptId
  })
}

// Bottleneck avoidance - avoid high-utilization departments
const avoidBottleneckDepartments = (route: number[], departments: DepartmentPathNode[]): number[] => {
  const deptMap = departments.reduce((acc, dept) => {
    acc[dept.id] = dept
    return acc
  }, {} as Record<number, DepartmentPathNode>)
  
  return route.map(deptId => {
    const currentDept = deptMap[deptId]
    if (!currentDept) return deptId
    
    // If current department is high-utilization, find alternatives
    if (currentDept.utilization > 80) {
      const alternatives = departments.filter(dept => 
        dept.id !== deptId &&
        dept.utilization < 70 &&
        dept.operations.some(op => currentDept.operations.includes(op))
      )
      
      if (alternatives.length > 0) {
        const leastUtilized = alternatives.reduce((best, current) => 
          current.utilization < best.utilization ? current : best
        )
        return leastUtilized.id
      }
    }
    
    return deptId
  })
}

// Priority routing for VIP customers and urgent orders
const addPriorityRouting = (route: number[], departments: DepartmentPathNode[]): number[] => {
  // For priority orders, prefer departments with:
  // 1. Higher reliability
  // 2. Lower utilization
  // 3. Better efficiency
  
  const deptMap = departments.reduce((acc, dept) => {
    acc[dept.id] = dept
    return acc
  }, {} as Record<number, DepartmentPathNode>)
  
  return route.map(deptId => {
    const currentDept = deptMap[deptId]
    if (!currentDept) return deptId
    
    // Calculate priority score for alternatives
    const alternatives = departments.filter(dept => 
      dept.id !== deptId &&
      dept.operations.some(op => currentDept.operations.includes(op))
    )
    
    if (alternatives.length > 0) {
      const bestAlternative = alternatives.reduce((best, current) => {
        const currentScore = (current.reliability * 0.4) + ((100 - current.utilization) * 0.4) + (current.cost > 0 ? (100 / current.cost) * 0.2 : 0)
        const bestScore = (best.reliability * 0.4) + ((100 - best.utilization) * 0.4) + (best.cost > 0 ? (100 / best.cost) * 0.2 : 0)
        return currentScore > bestScore ? current : best
      })
      
      const currentScore = (currentDept.reliability * 0.4) + ((100 - currentDept.utilization) * 0.4) + (currentDept.cost > 0 ? (100 / currentDept.cost) * 0.2 : 0)
      const alternativeScore = (bestAlternative.reliability * 0.4) + ((100 - bestAlternative.utilization) * 0.4) + (bestAlternative.cost > 0 ? (100 / bestAlternative.cost) * 0.2 : 0)
      
      if (alternativeScore > currentScore * 1.1) { // 10% improvement threshold
        return bestAlternative.id
      }
    }
    
    return deptId
  })
}

// Calculate comprehensive route metrics
export const calculateRouteMetrics = (route: number[], departments: Department[]): RouteMetrics => {
  const deptMap = departments.reduce((acc, dept) => {
    acc[dept.id] = dept
    return acc
  }, {} as Record<number, Department>)
  
  let totalTime = 0
  let totalCost = 0
  let reliabilityProduct = 1
  let bottleneckRisk = 0
  const uniqueDepartments = new Set(route)
  
  route.forEach(deptId => {
    const dept = deptMap[deptId]
    if (dept) {
      totalTime += dept.standardProcessingTime
      totalCost += dept.standardProcessingTime * 2.5
      reliabilityProduct *= dept.equipmentCondition
      
      if (dept.utilization > 80) {
        bottleneckRisk += 2
      } else if (dept.utilization > 60) {
        bottleneckRisk += 1
      }
    }
  })
  
  const flexibilityScore = uniqueDepartments.size / route.length // More unique departments = more flexibility
  
  return {
    totalTime,
    totalCost: Math.round(totalCost),
    reliability: reliabilityProduct,
    bottleneckRisk,
    flexibilityScore
  }
}

// Generate multiple route alternatives for comparison
export const generateRouteAlternatives = (
  rng: SeededRandom,
  departments: Department[],
  baseOptions: RouteGenerationOptions,
  count: number = 3
): number[][] => {
  const alternatives: number[][] = []
  
  // Generate alternatives with different optimization focuses
  const strategyOptions: RouteGenerationOptions[] = [
    { ...baseOptions, prioritizeSpeed: true },
    { ...baseOptions, prioritizeCost: true },
    { ...baseOptions, prioritizeReliability: true },
    { ...baseOptions, avoidBottlenecks: true }
  ]
  
  for (let i = 0; i < count && i < strategyOptions.length; i++) {
    const route = generateOptimizedRoute(rng, departments, strategyOptions[i])
    alternatives.push(route)
  }
  
  return alternatives
}

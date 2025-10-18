import type { GameSettings, GameState, GameSession, Department, Order, GamePerformance } from '../types'

// Random number generator with seed support
class SeededRandom {
  private seed: number

  constructor(seed?: string) {
    this.seed = seed ? this.hashCode(seed) : Math.random() * 2147483647
  }

  private hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  between(min: number, max: number): number {
    return min + this.next() * (max - min)
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }
}

// Generate random department capacities and characteristics
export const generateRandomDepartmentConfig = (rng: SeededRandom) => {
  return {
    capacity: Math.floor(rng.between(80, 120)), // 80-120% of base capacity
    efficiency: rng.between(0.8, 1.2), // Worker efficiency multiplier
    equipmentCondition: rng.between(0.95, 1.0), // Equipment reliability
    avgCycleTime: Math.floor(rng.between(15, 60)), // 15-60 minutes base cycle time
  }
}

// Generate initial WIP (Work in Progress)
export const generateInitialWIP = (rng: SeededRandom, complexityLevel: string): Order[] => {
  const wipCount = complexityLevel === 'beginner' ? rng.between(2, 4) : 
                   complexityLevel === 'intermediate' ? rng.between(4, 8) : 
                   rng.between(6, 12)

  // Sample customers for WIP generation
  const customers = [
    { id: 'CUST-001', name: 'Acme Manufacturing', tier: 'vip' },
    { id: 'CUST-002', name: 'TechCorp Solutions', tier: 'premium' },
    { id: 'CUST-003', name: 'Global Industries', tier: 'standard' }
  ]

  const priorities = ['low', 'normal', 'high', 'urgent']

  const orders: Order[] = []
  for (let i = 0; i < wipCount; i++) {
    const route = generateRandomRoute(rng, complexityLevel)
    const currentStep = Math.floor(rng.between(0, route.length))
    const customer = rng.choice(customers)
    const priority = rng.choice(priorities) as 'low' | 'normal' | 'high' | 'urgent'
    
    // Add half order logic to WIP as well
    const isHalfOrder = rng.next() < 0.15 // 15% chance for WIP orders
    const halfOrderReasons = ['defect_repair', 'partial_work', 'rework', 'quality_issue']
    const halfOrderReason = isHalfOrder ? halfOrderReasons[Math.floor(rng.next() * halfOrderReasons.length)] as 'defect_repair' | 'partial_work' | 'rework' | 'quality_issue' : undefined
    const processingTimeMultiplier = isHalfOrder ? rng.between(0.3, 0.7) : 1.0
    
    // Calculate processing times with randomization and half-order logic
    const baseProcessingTime = Math.floor(rng.between(2, 4)) // 2-4 minutes base
    const actualProcessingTime = Math.floor(baseProcessingTime * processingTimeMultiplier)
    const remainingTime = Math.floor(rng.between(0.5, actualProcessingTime))
    
    orders.push({
      id: `WIP-${String(i + 1).padStart(3, '0')}`,
      customerId: customer.id,
      customerName: customer.name,
      priority,
      orderValue: rng.between(1500, 8000) * (isHalfOrder ? 0.6 : 1.0), // Adjust value for half orders
      dueDate: new Date(Date.now() + rng.between(10, 30) * 60 * 1000), // 10-30 minutes (shorter)
      route,
      currentStepIndex: currentStep,
      status: 'processing',
      timestamps: generateTimestamps(route.slice(0, currentStep + 1)),
      reworkCount: 0,
      createdAt: new Date(Date.now() - rng.between(5, 15) * 60 * 1000), // Started 5-15 min ago
      processingTime: actualProcessingTime,
      processingTimeRemaining: remainingTime,
      currentDepartment: route[currentStep],
      slaStatus: rng.next() < 0.7 ? 'on-track' : rng.next() < 0.8 ? 'at-risk' : 'overdue',
      rushOrder: priority === 'urgent' && rng.next() < 0.2,
      isHalfOrder,
      halfOrderReason,
      processingTimeMultiplier,
      specialInstructions: isHalfOrder && halfOrderReason
        ? `Half Order: ${halfOrderReason.replace('_', ' ').toUpperCase()}`
        : priority === 'urgent'
        ? 'URGENT - Priority handling required'
        : undefined
    })
  }

  return orders
}

// Generate random order routes based on complexity
export const generateRandomRoute = (rng: SeededRandom, complexityLevel: string): number[] => {
  const departments = [1, 2, 3, 4]
  let routeLength: number
  
  switch (complexityLevel) {
    case 'beginner':
      routeLength = Math.floor(rng.between(2, 4))
      break
    case 'intermediate':
      routeLength = Math.floor(rng.between(3, 6))
      break
    case 'advanced':
      routeLength = Math.floor(rng.between(4, 8))
      break
    default:
      routeLength = 4
  }

  const route: number[] = []
  for (let i = 0; i < routeLength; i++) {
    // Ensure we don't repeat the same department consecutively (90% of the time)
    let nextDept: number
    do {
      nextDept = rng.choice(departments)
    } while (route.length > 0 && route[route.length - 1] === nextDept && rng.next() < 0.9)
    
    route.push(nextDept)
  }

  return route
}

// Generate timestamps for orders already in progress
const generateTimestamps = (completedSteps: number[]) => {
  return completedSteps.map((deptId, index) => ({
    deptId,
    start: new Date(Date.now() - (completedSteps.length - index) * 20 * 60 * 1000),
    end: new Date(Date.now() - (completedSteps.length - index - 1) * 20 * 60 * 1000)
  }))
}

// Initialize departments with random characteristics
export const initializeDepartments = (settings: GameSettings): Department[] => {
  const rng = new SeededRandom(settings.randomSeed)
  
  const baseDepartments = [
    { 
      id: 1, 
      name: 'Welding',
      standardProcessingTime: Math.floor(rng.between(2.5, 4)), // 2.5-4 minutes with randomization
      operations: [
        { id: 'weld-1', name: 'Joint Preparation', duration: 1, description: 'Prepare materials and setup welding equipment' },
        { id: 'weld-2', name: 'Welding Process', duration: 2, description: 'Execute welding according to specifications' },
        { id: 'weld-3', name: 'Weld Inspection', duration: 1, description: 'Visual inspection and quality check' }
      ]
    },
    { 
      id: 2, 
      name: 'Machining',
      standardProcessingTime: Math.floor(rng.between(3, 4)), // 3-4 minutes with randomization
      operations: [
        { id: 'mach-1', name: 'Setup & Programming', duration: 1, description: 'Machine setup and program loading' },
        { id: 'mach-2', name: 'Rough Machining', duration: 2, description: 'Initial material removal and shaping' },
        { id: 'mach-3', name: 'Finish Machining', duration: 1, description: 'Precision finishing and final dimensions' }
      ]
    },
    { 
      id: 3, 
      name: 'Painting',
      standardProcessingTime: Math.floor(rng.between(2, 3.5)), // 2-3.5 minutes with randomization
      operations: [
        { id: 'paint-1', name: 'Surface Preparation', duration: 1, description: 'Clean and prepare surface for painting' },
        { id: 'paint-2', name: 'Paint Application', duration: 1.5, description: 'Apply primer and topcoat' },
        { id: 'paint-3', name: 'Drying & Inspection', duration: 0.5, description: 'Final drying and quality inspection' }
      ]
    },
    { 
      id: 4, 
      name: 'Assembly',
      standardProcessingTime: Math.floor(rng.between(2, 4)), // 2-4 minutes with randomization
      operations: [
        { id: 'asm-1', name: 'Component Gathering', duration: 0.5, description: 'Collect all required components' },
        { id: 'asm-2', name: 'Product Assembly', duration: 2.5, description: 'Assemble components according to specifications' },
        { id: 'asm-3', name: 'Final Testing', duration: 1, description: 'Test assembled product functionality' }
      ]
    }
  ]

  return baseDepartments.map(dept => {
    const config = generateRandomDepartmentConfig(rng)
    
    return {
      ...dept,
      queue: [],
      utilization: Math.floor(rng.between(40, 85)), // Start with some utilization
      avgCycleTime: dept.standardProcessingTime,
      totalProcessed: Math.floor(rng.between(15, 35)), // Previous orders processed
      capacity: config.capacity,
      efficiency: config.efficiency,
      equipmentCondition: config.equipmentCondition,
      status: rng.next() < 0.8 ? 'available' : 'busy' as const,
      priorityRule: 'FIFO' as const, // Default to FIFO (First In, First Out)
      maxQueueSize: Math.floor(rng.between(8, 15)), // Each department can queue 8-15 orders
      wipCount: 0 // Will be calculated after WIP distribution
    }
  })
}

// Generate initial pending orders
export const generateInitialOrders = (settings: GameSettings): Order[] => {
  const rng = new SeededRandom(settings.randomSeed)
  const orderCount = settings.complexityLevel === 'beginner' ? rng.between(3, 6) : 
                     settings.complexityLevel === 'intermediate' ? rng.between(5, 10) : 
                     rng.between(8, 15)

  // Sample customers for order generation
  const customers = [
    { id: 'CUST-001', name: 'Acme Manufacturing', tier: 'vip' },
    { id: 'CUST-002', name: 'TechCorp Solutions', tier: 'premium' },
    { id: 'CUST-003', name: 'Global Industries', tier: 'standard' },
    { id: 'CUST-004', name: 'Precision Parts Ltd', tier: 'premium' },
    { id: 'CUST-005', name: 'Quick Delivery Co', tier: 'standard' }
  ]

  const priorities = ['low', 'normal', 'high', 'urgent']

  const orders: Order[] = []
  for (let i = 0; i < orderCount; i++) {
    const route = generateRandomRoute(rng, settings.complexityLevel)
    const customer = rng.choice(customers)
    const priority = rng.choice(priorities) as 'low' | 'normal' | 'high' | 'urgent'
    const isRush = priority === 'urgent' && rng.next() < 0.3 // 30% chance for urgent orders to be rush
    
    // Determine if this is a half order (20% chance)
    const isHalfOrder = rng.next() < 0.2
    const halfOrderReasons = ['defect_repair', 'partial_work', 'rework', 'quality_issue']
    const halfOrderReason = isHalfOrder ? halfOrderReasons[Math.floor(rng.next() * halfOrderReasons.length)] as 'defect_repair' | 'partial_work' | 'rework' | 'quality_issue' : undefined
    const processingTimeMultiplier = isHalfOrder ? rng.between(0.3, 0.7) : 1.0 // Half orders take 30-70% of normal time

    // Order value based on priority, customer tier, and half order status
    const baseValue = rng.between(2000, 20000)
    const tierMultiplier = customer.tier === 'vip' ? 1.5 : customer.tier === 'premium' ? 1.2 : 1.0
    const priorityMultiplier = priority === 'urgent' ? 1.3 : priority === 'high' ? 1.1 : 1.0
    const halfOrderMultiplier = isHalfOrder ? 0.6 : 1.0 // Half orders are worth 60% of normal orders
    const orderValue = Math.floor(baseValue * tierMultiplier * priorityMultiplier * halfOrderMultiplier)

    orders.push({
      id: `ORD-${String(i + 1).padStart(3, '0')}`,
      customerId: customer.id,
      customerName: customer.name,
      priority,
      orderValue,
      dueDate: new Date(Date.now() + rng.between(15, 45) * 60 * 1000), // 15-45 minutes (shorter due to faster processing)
      route,
      currentStepIndex: -1, // Not started yet
      status: 'queued',
      timestamps: [],
      reworkCount: 0,
      createdAt: new Date(),
      slaStatus: 'on-track',
      rushOrder: isRush,
      isHalfOrder,
      halfOrderReason,
      processingTimeMultiplier,
      specialInstructions: isHalfOrder && halfOrderReason
        ? `Half Order: ${halfOrderReason.replace('_', ' ').toUpperCase()}` 
        : isRush 
        ? 'URGENT - Priority handling required' 
        : customer.tier === 'vip' 
        ? 'VIP customer - ensure quality' 
        : undefined
    })
  }

  return orders
}

// Create initial game session
export const createGameSession = (settings: GameSettings): GameSession => {
  return {
    id: `session-${Date.now()}`,
    duration: settings.sessionDuration * 60 * 1000, // Convert minutes to milliseconds
    status: 'setup',
    settings,
    elapsedTime: 0
  }
}

// Initialize complete game state
export const initializeGameState = (settings: GameSettings): GameState => {
  const rng = new SeededRandom(settings.randomSeed)
  const session = createGameSession(settings)
  const departments = initializeDepartments(settings)
  const pendingOrders = generateInitialOrders(settings)
  const wipOrders = generateInitialWIP(rng, settings.complexityLevel)

  // Distribute WIP orders to departments
  wipOrders.forEach(order => {
    if (order.currentDepartment) {
      const dept = departments.find(d => d.id === order.currentDepartment)
      if (dept) {
        if (order.status === 'processing') {
          dept.inProcess = order
        } else {
          dept.queue.push(order)
        }
      }
    }
  })

  // Update WIP counts for each department
  departments.forEach(dept => {
    dept.wipCount = dept.queue.length + (dept.inProcess ? 1 : 0)
  })

  const initialPerformance: GamePerformance = {
    onTimeDeliveryRate: 0,
    averageLeadTime: 0,
    totalThroughput: 0,
    utilizationRates: departments.reduce((acc, dept) => {
      acc[dept.id] = dept.utilization
      return acc
    }, {} as { [key: number]: number })
  }

  return {
    session,
    departments,
    pendingOrders,
    completedOrders: [],
    rejectedOrders: [],
    totalOrdersGenerated: pendingOrders.length + wipOrders.length,
    gameEvents: [{
      id: `event-${Date.now()}`,
      type: 'order-generated',
      timestamp: new Date(),
      message: `Game initialized with ${pendingOrders.length} pending orders and ${wipOrders.length} WIP orders`,
      severity: 'info'
    }],
    performance: initialPerformance,
    sessionLog: {
      sessionId: session.id,
      startTime: new Date(),
      endTime: undefined,
      settings: settings,
      events: [],
      finalPerformance: initialPerformance,
      decisions: []
    },
    decisions: [],
    forecastData: {
      averageLeadTime: 45, // Initial estimate in minutes
      capacityUtilization: 0.7, // 70% average utilization
      expectedDeliveryDates: {},
      bottleneckDepartment: null,
      wipCapacity: departments.reduce((acc, dept) => {
        acc[dept.id] = dept.capacity
        return acc
      }, {} as { [key: number]: number })
    },
    customers: [
      {
        id: 'CUST-001',
        name: 'Acme Manufacturing',
        tier: 'vip',
        contactEmail: 'orders@acme-mfg.com',
        totalOrders: 45,
        onTimeDeliveryRate: 92.5,
        averageOrderValue: 15000
      },
      {
        id: 'CUST-002', 
        name: 'TechCorp Solutions',
        tier: 'premium',
        contactEmail: 'procurement@techcorp.com',
        totalOrders: 28,
        onTimeDeliveryRate: 88.2,
        averageOrderValue: 8500
      },
      {
        id: 'CUST-003',
        name: 'Global Industries',
        tier: 'standard',
        contactEmail: 'orders@global-ind.com',
        totalOrders: 67,
        onTimeDeliveryRate: 85.7,
        averageOrderValue: 5200
      },
      {
        id: 'CUST-004',
        name: 'Precision Parts Ltd',
        tier: 'premium',
        contactEmail: 'purchasing@precision-parts.com',
        totalOrders: 34,
        onTimeDeliveryRate: 91.1,
        averageOrderValue: 12300
      },
      {
        id: 'CUST-005',
        name: 'Quick Delivery Co',
        tier: 'standard',
        contactEmail: 'rush@quickdelivery.com',
        totalOrders: 23,
        onTimeDeliveryRate: 79.8,
        averageOrderValue: 6800
      }
    ]
  }
}

// Export seeded random for consistent behavior during testing
export { SeededRandom }

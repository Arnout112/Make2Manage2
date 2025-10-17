import React, { useState } from 'react'
import { Package, ArrowRight, CheckCircle, Play, Pause, RotateCcw } from 'lucide-react'

// Simple order interface for our manual processing game
interface SimpleOrder {
  id: string
  customer: string
  product: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  route: number[] // Department processing route
  currentStep: number // Current step in the route
  status: 'waiting' | 'processing' | 'completed'
  startTime?: Date
  completedTime?: Date
}

// Department interface
interface Department {
  id: number
  name: string
  color: string
  busy: boolean
  currentOrder?: string
}

export default function ManualGameScreen() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false)
  const [gameTime, setGameTime] = useState(0) // in minutes
  
  // Initial departments setup
  const [departments] = useState<Department[]>([
    { id: 1, name: 'Quality Control', color: 'bg-green-100 border-green-300', busy: false },
    { id: 2, name: 'Assembly', color: 'bg-blue-100 border-blue-300', busy: false },
    { id: 3, name: 'Machining', color: 'bg-yellow-100 border-yellow-300', busy: false },
    { id: 4, name: 'Preparation', color: 'bg-purple-100 border-purple-300', busy: false }
  ])
  
  // Initial orders - students will manually process these
  const [orders, setOrders] = useState<SimpleOrder[]>([
    {
      id: 'ORD-001',
      customer: 'TechCorp',
      product: 'Widget A',
      priority: 'HIGH',
      route: [4, 3, 1, 2], // Prep → Machining → QC → Assembly
      currentStep: 0,
      status: 'waiting'
    },
    {
      id: 'ORD-002',
      customer: 'ManufacturingCo',
      product: 'Widget B',
      priority: 'MEDIUM',
      route: [4, 1, 3, 2], // Prep → QC → Machining → Assembly
      currentStep: 0,
      status: 'waiting'
    },
    {
      id: 'ORD-003',
      customer: 'IndustrialLtd',
      product: 'Widget C',
      priority: 'LOW',
      route: [3, 4, 1, 2], // Machining → Prep → QC → Assembly
      currentStep: 0,
      status: 'waiting'
    }
  ])

  // Function to process an order to the next step
  const processOrderStep = (orderId: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId && order.status !== 'completed') {
          const nextStep = order.currentStep + 1
          const isCompleted = nextStep >= order.route.length
          
          return {
            ...order,
            currentStep: nextStep,
            status: isCompleted ? 'completed' : 'processing',
            startTime: order.startTime || new Date(),
            completedTime: isCompleted ? new Date() : undefined
          }
        }
        return order
      })
    )
  }

  // Reset the game
  const resetGame = () => {
    setGameStarted(false)
    setGameTime(0)
    setOrders(orders.map(order => ({
      ...order,
      currentStep: 0,
      status: 'waiting',
      startTime: undefined,
      completedTime: undefined
    })))
  }

  // Get current department for an order
  const getCurrentDepartment = (order: SimpleOrder) => {
    if (order.currentStep >= order.route.length) return null
    const deptId = order.route[order.currentStep]
    return departments.find(d => d.id === deptId)
  }

  // Get next department for an order
  const getNextDepartment = (order: SimpleOrder) => {
    if (order.currentStep + 1 >= order.route.length) return null
    const deptId = order.route[order.currentStep + 1]
    return departments.find(d => d.id === deptId)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manual Order Processing Game</h1>
          <p className="text-gray-600 mt-2">
            Click orders through each department step-by-step to learn manufacturing flow
          </p>
        </div>

        {/* Game Controls */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGameStarted(!gameStarted)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  gameStarted 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {gameStarted ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {gameStarted ? 'Pause Game' : 'Start Game'}
              </button>
              
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Game Time</p>
              <p className="text-xl font-bold">{gameTime} min</p>
            </div>
          </div>
        </div>

        {/* Departments Overview */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h2 className="text-xl font-semibold mb-4">Manufacturing Departments</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {departments.map(dept => (
              <div key={dept.id} className={`p-4 rounded-lg border-2 ${dept.color}`}>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">Dept {dept.id}</div>
                  <div className="text-sm text-gray-600">{dept.name}</div>
                  <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-medium ${
                    dept.busy ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                  }`}>
                    {dept.busy ? 'Busy' : 'Available'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Processing */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Orders to Process</h2>
          <div className="space-y-4">
            {orders.map(order => {
              const currentDept = getCurrentDepartment(order)
              const nextDept = getNextDepartment(order)
              const isCompleted = order.status === 'completed'
              
              return (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <Package className="w-6 h-6 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">{order.id}</h3>
                          <p className="text-sm text-gray-600">{order.customer} - {order.product}</p>
                          <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            order.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            order.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {order.priority}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Route Progress */}
                    <div className="flex-1 mx-6">
                      <div className="flex items-center justify-center gap-2">
                        {order.route.map((deptId, index) => {
                          const isStepCompleted = index < order.currentStep
                          const isCurrentStep = index === order.currentStep && !isCompleted
                          
                          return (
                            <React.Fragment key={index}>
                              <div className={`px-3 py-1 rounded border-2 text-sm font-medium ${
                                isStepCompleted ? 'bg-green-100 border-green-300 text-green-800' :
                                isCurrentStep ? 'bg-blue-100 border-blue-300 text-blue-800' :
                                'bg-gray-100 border-gray-300 text-gray-600'
                              }`}>
                                Dept {deptId}
                              </div>
                              {index < order.route.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Completed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => processOrderStep(order.id)}
                          disabled={!gameStarted}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            gameStarted 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {currentDept ? `Process in ${currentDept.name}` : 'Complete Order'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Status */}
                  <div className="mt-3 text-sm text-gray-600">
                    {isCompleted ? (
                      <span>✅ Order completed at {order.completedTime?.toLocaleTimeString()}</span>
                    ) : currentDept ? (
                      <span>🔄 Currently at: {currentDept.name} (Dept {currentDept.id})</span>
                    ) : (
                      <span>⏳ Waiting to start</span>
                    )}
                    {nextDept && !isCompleted && (
                      <span className="ml-4">→ Next: {nextDept.name} (Dept {nextDept.id})</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Play</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Click "Start Game" to begin the session</li>
            <li>Click the "Process" button for each order to move it through departments</li>
            <li>Follow the route shown for each order (arrows show the sequence)</li>
            <li>Watch how different routes affect processing time and coordination</li>
            <li>Try to complete all orders efficiently</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
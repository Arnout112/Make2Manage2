import { TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import type { ForecastData, Order } from '../types'

interface DeliveryForecastProps {
  forecastData: ForecastData
  pendingOrders: Order[]
}

export default function DeliveryForecast({ forecastData, pendingOrders }: DeliveryForecastProps) {
  
  const getForecastStatus = (expectedDate: Date, dueDate: Date) => {
    const buffer = expectedDate.getTime() - dueDate.getTime()
    if (buffer < 0) return 'late'
    if (buffer < 30 * 60 * 1000) return 'at-risk' // Less than 30 min buffer
    return 'on-time'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
          Delivery Forecast (R04)
        </h3>
        <div className="text-sm text-gray-600">
          Based on current WIP capacity
        </div>
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">
            {forecastData.averageLeadTime.toFixed(1)}min
          </div>
          <div className="text-sm text-gray-600">Avg Lead Time</div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {forecastData.capacityUtilization.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">Capacity Utilization</div>
        </div>

        <div className="text-center p-4 bg-amber-50 rounded-lg">
          <div className="text-2xl font-bold text-amber-600">
            Dept {forecastData.bottleneckDepartment || 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Bottleneck</div>
        </div>
      </div>

      {/* WIP Capacity by Department */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">WIP Capacity by Department</h4>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(forecastData.wipCapacity).map(([deptId, capacity]) => (
            <div key={deptId} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-800">Dept {deptId}</div>
              <div className="text-sm text-gray-600">{capacity} orders</div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Delivery Forecasts */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Expected Delivery Dates</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {pendingOrders.slice(0, 10).map((order) => {
            const expectedDate = forecastData.expectedDeliveryDates[order.id]
            if (!expectedDate) return null

            const status = getForecastStatus(expectedDate, order.dueDate)
            const statusConfig = {
              'on-time': { 
                icon: CheckCircle, 
                color: 'text-green-600', 
                bg: 'bg-green-50 border-green-200' 
              },
              'at-risk': { 
                icon: AlertTriangle, 
                color: 'text-amber-600', 
                bg: 'bg-amber-50 border-amber-200' 
              },
              'late': { 
                icon: AlertTriangle, 
                color: 'text-red-600', 
                bg: 'bg-red-50 border-red-200' 
              }
            }

            const config = statusConfig[status]
            const Icon = config.icon

            return (
              <div 
                key={order.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${config.bg}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="font-mono text-sm font-semibold">{order.id}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {order.route.join('→')}
                  </span>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">
                    Expected: {formatDate(expectedDate)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Due: {formatDate(order.dueDate)}
                  </div>
                </div>
              </div>
            )
          })}
          
          {pendingOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No pending orders to forecast
            </div>
          )}
          
          {pendingOrders.length > 10 && (
            <div className="text-center py-2 text-gray-500 text-sm">
              Showing first 10 orders. {pendingOrders.length - 10} more orders in queue.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

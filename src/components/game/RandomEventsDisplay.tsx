import { AlertTriangle, Zap, Clock, TrendingUp, X } from 'lucide-react'
import type { GameEvent } from '../types'

interface RandomEventsDisplayProps {
  events: GameEvent[]
  onDismissEvent?: (eventId: string) => void
}

export default function RandomEventsDisplay({ events, onDismissEvent }: RandomEventsDisplayProps) {
  // Filter for active random events (equipment failures, rush orders, etc.)
  const activeEvents = events.filter(event => 
    ['equipment-failure', 'rush-order', 'delivery-delay', 'efficiency-boost'].includes(event.type)
  ).slice(-3) // Show last 3 events

  if (activeEvents.length === 0) {
    return null
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'equipment-failure':
        return <AlertTriangle size={16} className="text-red-500" />
      case 'rush-order':
        return <TrendingUp size={16} className="text-orange-500" />
      case 'delivery-delay':
        return <Clock size={16} className="text-yellow-500" />
      case 'efficiency-boost':
        return <Zap size={16} className="text-green-500" />
      default:
        return <AlertTriangle size={16} className="text-gray-500" />
    }
  }

  const getEventBorderColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="space-y-2 mb-4">
      <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
        <Zap size={16} className="text-purple-600" />
        <span>Active Events (R07)</span>
      </h4>
      
      {activeEvents.map((event) => (
        <div
          key={event.id}
          className={`flex items-start space-x-3 p-3 rounded-lg border-2 ${getEventBorderColor(event.severity)} transition-all duration-300`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getEventIcon(event.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">
              {event.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {event.timestamp.toLocaleTimeString()}
              {event.departmentId && ` • Department ${event.departmentId}`}
            </p>
          </div>
          
          {onDismissEvent && (
            <button
              onClick={() => onDismissEvent(event.id)}
              className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition-colors"
              title="Dismiss event"
            >
              <X size={12} className="text-gray-400" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

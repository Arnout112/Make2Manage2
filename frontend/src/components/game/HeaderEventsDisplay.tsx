import { AlertTriangle, Zap, Clock, TrendingUp } from 'lucide-react'
import type { GameEvent } from '../../types'

interface HeaderEventsDisplayProps {
  events: GameEvent[]
}

export default function HeaderEventsDisplay({ events }: HeaderEventsDisplayProps) {
  // Filter for active random events (equipment failures, rush orders, etc.)
  const activeEvents = events.filter(event => 
    ['equipment-failure', 'rush-order', 'delivery-delay', 'efficiency-boost'].includes(event.type)
  ).slice(-2) // Show last 2 events in header to save space

  if (activeEvents.length === 0) {
    return null
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'equipment-failure':
        return <AlertTriangle size={14} className="text-red-500" />
      case 'rush-order':
        return <TrendingUp size={14} className="text-orange-500" />
      case 'delivery-delay':
        return <Clock size={14} className="text-yellow-500" />
      case 'efficiency-boost':
        return <Zap size={14} className="text-green-500" />
      default:
        return <AlertTriangle size={14} className="text-gray-500" />
    }
  }

  const getEventBgColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800'
      case 'warning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'success':
        return 'bg-green-100 border-green-300 text-green-800'
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800'
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {activeEvents.map((event) => (
        <div
          key={event.id}
          className={`flex items-center space-x-1.5 px-2 py-1 rounded-md border text-xs font-medium ${getEventBgColor(event.severity)} transition-all duration-300`}
          title={`${event.message} (${event.timestamp.toLocaleTimeString()})`}
        >
          {getEventIcon(event.type)}
          <span className="truncate max-w-32">
            {event.message}
          </span>
        </div>
      ))}
    </div>
  )
}
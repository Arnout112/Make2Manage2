import { Download, FileText, Database } from 'lucide-react'
import type { SessionLog, GameState } from '../types'

interface ExportControlsProps {
  gameState: GameState
  onExport: (format: 'csv' | 'json') => void
}

export default function ExportControls({ gameState, onExport }: ExportControlsProps) {
  
  const generateSessionData = () => {
    const sessionLog: SessionLog = {
      sessionId: gameState.session.id,
      startTime: gameState.session.startTime || new Date(),
      endTime: gameState.session.endTime,
      settings: gameState.session.settings,
      events: gameState.gameEvents,
      finalPerformance: gameState.performance,
      decisions: gameState.decisions || []
    }
    return sessionLog
  }

  const exportToCSV = () => {
    const sessionData = generateSessionData()
    
    // Create CSV content
    const headers = [
      'event_type',
      'timestamp',
      'order_id',
      'decision_id', 
      'department_id',
      'message',
      'severity',
      'lead_time',
      'on_time_rate',
      'throughput',
      'utilization_avg'
    ]

    const rows = sessionData.events.map(event => [
      event.type,
      event.timestamp.toISOString(),
      event.orderId || '',
      event.decisionId || '',
      event.departmentId || '',
      `"${event.message.replace(/"/g, '""')}"`, // Escape quotes
      event.severity,
      event.kpiSnapshot?.averageLeadTime || '',
      event.kpiSnapshot?.onTimeDeliveryRate || '',
      event.kpiSnapshot?.totalThroughput || '',
      event.kpiSnapshot?.utilizationRates ? 
        Object.values(event.kpiSnapshot.utilizationRates).reduce((a, b) => a + b, 0) / Object.values(event.kpiSnapshot.utilizationRates).length : ''
    ])

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `make2manage_session_${sessionData.sessionId}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    onExport('csv')
  }

  const exportToJSON = () => {
    const sessionData = generateSessionData()
    
    // Create formatted JSON
    const jsonContent = JSON.stringify(sessionData, null, 2)
    
    // Download file
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `make2manage_session_${sessionData.sessionId}_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    onExport('json')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Export Session Data (R12)
        </h3>
        <div className="text-sm text-gray-600">
          {gameState.gameEvents.length} events recorded
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={exportToCSV}
          className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={exportToJSON}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Database className="w-4 h-4" />
          <span>Export JSON</span>
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>CSV:</strong> event_type, timestamp, order_id, decision_id, KPI_snapshot</p>
        <p><strong>JSON:</strong> Complete session log with all events and performance data</p>
      </div>
    </div>
  )
}

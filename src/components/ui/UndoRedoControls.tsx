import { Undo2, Redo2, RotateCcw } from 'lucide-react'
import type { Decision } from '../types'

interface UndoRedoControlsProps {
  decisions: Decision[]
  currentDecisionIndex: number
  onUndo: () => void
  onRedo: () => void
  onClearHistory: () => void
}

export default function UndoRedoControls({ 
  decisions, 
  currentDecisionIndex,
  onUndo, 
  onRedo, 
  onClearHistory 
}: UndoRedoControlsProps) {
  const canUndo = currentDecisionIndex >= 0 && decisions.length > 0
  const canRedo = currentDecisionIndex < decisions.length - 1
  const recentDecisions = decisions.slice(-5) // Show last 5 decisions

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
          <RotateCcw size={16} className="text-purple-600" />
          <span>Decision History (R13)</span>
        </h4>
        
        <div className="flex items-center space-x-2">
          {/* Undo Button */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              canUndo 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={canUndo ? 'Undo last decision' : 'No decisions to undo'}
          >
            <Undo2 size={14} />
            <span>Undo</span>
          </button>

          {/* Redo Button */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              canRedo 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={canRedo ? 'Redo last undone decision' : 'No decisions to redo'}
          >
            <Redo2 size={14} />
            <span>Redo</span>
          </button>

          {/* Clear History Button */}
          {decisions.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              title="Clear all decision history"
            >
              <RotateCcw size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Decision History */}
      {recentDecisions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-2">Recent Decisions:</p>
          {recentDecisions.map((decision) => {
            const isActive = currentDecisionIndex === decisions.indexOf(decision)
            const isUndone = currentDecisionIndex < decisions.indexOf(decision)
            
            return (
              <div
                key={decision.id}
                className={`p-2 rounded-lg text-xs transition-all ${
                  isActive 
                    ? 'bg-blue-100 border border-blue-200' 
                    : isUndone
                    ? 'bg-red-50 border border-red-200 opacity-60'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize text-gray-700">
                    {decision.type.replace('-', ' ')}
                  </span>
                  <span className="text-gray-500">
                    {decision.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-600 mt-1 truncate">
                  {decision.description}
                </p>
                {decision.orderId && (
                  <p className="text-blue-600 mt-1">
                    Order: {decision.orderId}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No decisions recorded yet. Start making decisions to enable undo/redo.
        </p>
      )}

      {/* Stats */}
      {decisions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total decisions: {decisions.length}</span>
            <span>Current position: {currentDecisionIndex + 1}/{decisions.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}

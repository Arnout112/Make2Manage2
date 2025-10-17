import { useState } from 'react'
import { Settings, Clock, Zap, Target, AlertCircle } from 'lucide-react'
import type { GameSettings } from '../types'

interface GameSettingsModalProps {
  currentSettings: GameSettings
  onUpdateSettings: (settings: GameSettings) => void
  onClose: () => void
  isOpen: boolean
}

export default function GameSettingsModal({ 
  currentSettings, 
  onUpdateSettings, 
  onClose, 
  isOpen 
}: GameSettingsModalProps) {
  const [settings, setSettings] = useState<GameSettings>(currentSettings)

  const handleSave = () => {
    onUpdateSettings(settings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Game Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* R05: Session Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Clock className="w-4 h-4 inline mr-2" />
              Session Duration (R05)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[15, 30, 60].map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSettings({ ...settings, sessionDuration: duration as 15 | 30 | 60 })}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    settings.sessionDuration === duration
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {duration} minutes
                </button>
              ))}
            </div>
          </div>

          {/* R05: Game Speed Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Zap className="w-4 h-4 inline mr-2" />
              Game Speed Multiplier (R05)
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 4, 8].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSettings({ ...settings, gameSpeed: speed as 1 | 2 | 4 | 8 })}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    settings.gameSpeed === speed
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Higher speeds make the simulation run faster</p>
          </div>

          {/* Order Generation Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Target className="w-4 h-4 inline mr-2" />
              Order Generation Rate
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as const).map((rate) => (
                <button
                  key={rate}
                  onClick={() => setSettings({ ...settings, orderGenerationRate: rate })}
                  className={`p-3 rounded-lg border-2 transition-colors capitalize ${
                    settings.orderGenerationRate === rate
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {rate}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Complexity Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSettings({ ...settings, complexityLevel: level })}
                  className={`p-3 rounded-lg border-2 transition-colors capitalize ${
                    settings.complexityLevel === level
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* R07: Enable Events */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.enableEvents}
                onChange={(e) => setSettings({ ...settings, enableEvents: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Enable Random Events (R07)
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-7">Equipment failures, delivery delays, rush orders</p>
          </div>

          {/* R06: Enable Advanced Routing */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.enableAdvancedRouting}
                onChange={(e) => setSettings({ ...settings, enableAdvancedRouting: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                <Target className="w-4 h-4 inline mr-2" />
                Enable Advanced Routing (R06)
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-7">Intelligent route optimization, bottleneck avoidance, priority routing</p>
          </div>

          {/* Random Seed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Random Seed (Optional)
            </label>
            <input
              type="text"
              value={settings.randomSeed || ''}
              onChange={(e) => setSettings({ ...settings, randomSeed: e.target.value || undefined })}
              placeholder="Leave empty for random scenarios"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Use same seed for reproducible scenarios</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  )
}

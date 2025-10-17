import { Play, BookOpen, Target, Zap, Clock } from 'lucide-react'
import type { GameSettings } from '../types'

interface QuickStartScenariosProps {
  onSelectScenario: (settings: GameSettings) => void
  onClose: () => void
  isOpen: boolean
}

interface Scenario {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{size?: number, className?: string}>
  settings: GameSettings
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  learningObjectives: string[]
}

const scenarios: Scenario[] = [
  {
    id: 'tutorial',
    name: 'Tutorial Mode',
    description: 'Perfect for first-time players. Slow pace, guided experience.',
    icon: BookOpen,
    difficulty: 'beginner',
    settings: {
      sessionDuration: 15,
      gameSpeed: 1,
      orderGenerationRate: 'low',
      complexityLevel: 'beginner',
      enableEvents: false,
      enableAdvancedRouting: false,
      randomSeed: 'tutorial-seed'
    },
    learningObjectives: [
      'Understanding order flow',
      'Basic department operations',
      'Queue management concepts'
    ]
  },
  {
    id: 'balanced',
    name: 'Balanced Production',
    description: 'Standard scenario with moderate complexity and events.',
    icon: Target,
    difficulty: 'intermediate',
    settings: {
      sessionDuration: 30,
      gameSpeed: 1,
      orderGenerationRate: 'medium',
      complexityLevel: 'intermediate',
      enableEvents: true,
      enableAdvancedRouting: true,
      randomSeed: 'balanced-seed'
    },
    learningObjectives: [
      'Balancing efficiency vs quality',
      'Handling random events',
      'Performance optimization'
    ]
  },
  {
    id: 'rush-mode',
    name: 'Rush Mode',
    description: 'High-speed, high-volume production with tight deadlines.',
    icon: Zap,
    difficulty: 'advanced',
    settings: {
      sessionDuration: 15,
      gameSpeed: 2,
      orderGenerationRate: 'high',
      complexityLevel: 'advanced',
      enableEvents: true,
      enableAdvancedRouting: true,
      randomSeed: 'rush-seed'
    },
    learningObjectives: [
      'Crisis management',
      'Rapid decision making',
      'Bottleneck identification'
    ]
  },
  {
    id: 'endurance',
    name: 'Endurance Challenge',
    description: 'Long session to test sustained performance over time.',
    icon: Clock,
    difficulty: 'advanced',
    settings: {
      sessionDuration: 60,
      gameSpeed: 2,
      orderGenerationRate: 'medium',
      complexityLevel: 'advanced',
      enableEvents: true,
      enableAdvancedRouting: true,
      randomSeed: 'endurance-seed'
    },
    learningObjectives: [
      'Long-term planning',
      'Sustained performance',
      'Resource management'
    ]
  }
]

export default function QuickStartScenarios({ onSelectScenario, onClose, isOpen }: QuickStartScenariosProps) {
  if (!isOpen) return null

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100'
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100'
      case 'advanced':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
            <Play className="text-blue-600" size={28} />
            <span>Quick Start Scenarios (R08)</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <p className="text-gray-600 mb-8">
          Choose a pre-configured scenario to jump right into learning. Each scenario is designed 
          to teach specific aspects of make-to-order production planning.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon
            return (
              <div
                key={scenario.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => onSelectScenario(scenario.settings)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Icon size={24} className="text-blue-600 group-hover:text-blue-700" />
                    <h3 className="text-lg font-semibold text-gray-800">{scenario.name}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(scenario.difficulty)}`}>
                    {scenario.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{scenario.description}</p>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Objectives:</h4>
                  <ul className="space-y-1">
                    {scenario.learningObjectives.map((objective, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 border-t border-gray-200 pt-4">
                  <div>
                    <span className="font-medium">Duration:</span> {scenario.settings.sessionDuration}min
                  </div>
                  <div>
                    <span className="font-medium">Speed:</span> {scenario.settings.gameSpeed}x
                  </div>
                  <div>
                    <span className="font-medium">Complexity:</span> {scenario.settings.complexityLevel}
                  </div>
                  <div>
                    <span className="font-medium">Events:</span> {scenario.settings.enableEvents ? 'On' : 'Off'}
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
                    Start Scenario
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

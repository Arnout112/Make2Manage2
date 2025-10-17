import { Factory, BarChart3, Users, Target, Book, Play, MousePointer } from 'lucide-react'
import type { ScreenType } from '../types'

interface LandingScreenProps {
  onNavigate: (screen: ScreenType) => void
}

export default function LandingScreen({ onNavigate }: LandingScreenProps) {
  const features = [
    {
      icon: Factory,
      title: 'Factory Simulation',
      description: 'Experience real-time make-to-order production planning with interactive departments and order routing.'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track lead times, utilization rates, and bottlenecks to optimize your manufacturing processes.'
    },
    {
      icon: Users,
      title: 'Educational Focus',
      description: 'Designed for business students and lifelong learners in the Limburg SME manufacturing industry.'
    },
    {
      icon: Target,
      title: 'Decision Making',
      description: 'Learn to balance cost efficiency with delivery reliability in dynamic market conditions.'
    }
  ]

  const learningObjectives = [
    'Understanding make-to-order production planning',
    'Balancing cost efficiency with delivery reliability', 
    'Managing complex manufacturing processes',
    'Decision making in dynamic market conditions'
  ]

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-8">
            <Factory size={40} className="text-white" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Make2Manage
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A digital learning game designed to teach manufacturing planning and control concepts 
            in the Limburg SME manufacturing industry
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => onNavigate('game')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg"
            >
              <Play size={24} />
              <span>Start Game</span>
            </button>
            
            <button
              onClick={() => onNavigate('manual-game')}
              className="flex items-center space-x-2 bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-colors text-lg font-semibold shadow-lg"
            >
              <MousePointer size={24} />
              <span>Manual Game</span>
            </button>
            
            <button
              onClick={() => onNavigate('analytics')}
              className="flex items-center space-x-2 bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg font-semibold"
            >
              <BarChart3 size={24} />
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-8 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Game Features</h2>
            <p className="text-xl text-gray-600">Interactive learning through realistic manufacturing scenarios</p>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <feature.icon size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="px-8 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-6">
              <Book size={32} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Learning Objectives</h2>
            <p className="text-xl text-gray-600">What you'll learn through this interactive experience</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {learningObjectives.map((objective, index) => (
              <div key={index} className="flex items-center p-6 bg-white rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 shrink-0">
                  <span className="text-green-600 font-bold text-sm">{index + 1}</span>
                </div>
                <p className="text-gray-700 font-medium">{objective}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div className="px-8 py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-xl mb-6">
            <Users size={32} className="text-purple-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Target Audience</h2>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Business Students</h3>
              <p className="text-purple-700">TBK day education participants</p>
            </div>
            
            <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Lifelong Learners</h3>
              <p className="text-purple-700">LLO education participants</p>
            </div>
            
            <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Professionals</h3>
              <p className="text-purple-700">Management and planners in manufacturing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="px-8 py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Learning?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Begin your journey into manufacturing planning and control
          </p>
          
          <button
            onClick={() => onNavigate('game')}
            className="flex items-center space-x-3 bg-white text-blue-600 px-12 py-4 rounded-xl hover:bg-gray-100 transition-colors text-xl font-semibold mx-auto shadow-lg"
          >
            <Play size={28} />
            <span>Launch Game</span>
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { GraduationCap, Target, TrendingUp, Award, Brain, BarChart3, CheckCircle, Star } from 'lucide-react'
import type { GameState } from '../types'

interface LearningAnalyticsProps {
  gameState: GameState
  onExportProgress?: () => void
}

interface Achievement {
  id: string
  title: string
  description: string
  category: 'efficiency' | 'quality' | 'planning' | 'problem-solving' | 'decision-making'
  level: 'bronze' | 'silver' | 'gold'
  earnedAt: Date
  points: number
}

interface SessionMetrics {
  onTimeDeliveryRate: number
  avgLeadTime: number
  totalThroughput: number
  decisionQuality: number
  resourceUtilization: number
  customerSatisfaction: number
  problemSolvingScore: number
}

interface LearningObjective {
  id: string
  title: string
  description: string
  category: 'manufacturing-planning' | 'capacity-management' | 'customer-service' | 'optimization' | 'crisis-management'
  targetProficiency: number
  currentProficiency: number
  practiced: boolean
  mastered: boolean
}

interface SkillAssessment {
  skill: string
  category: string
  currentLevel: number
  targetLevel: number
  progress: number
  evidence: string[]
  recommendations: string[]
}

export default function LearningAnalytics({ gameState, onExportProgress }: LearningAnalyticsProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'skills' | 'progress' | 'achievements' | 'feedback'>('overview')

  // Calculate real-time learning metrics from current game state
  const currentSessionMetrics = useMemo((): SessionMetrics => {
    const completedOrders = gameState.completedOrders
    const totalOrders = gameState.totalOrdersGenerated
    
    const onTimeOrders = completedOrders.filter(o => o.status === 'completed-on-time').length
    const onTimeRate = completedOrders.length > 0 ? (onTimeOrders / completedOrders.length) * 100 : 0
    
    const avgLeadTime = completedOrders.length > 0 
      ? completedOrders.reduce((sum, o) => sum + (o.actualLeadTime || 0), 0) / completedOrders.length 
      : 0
    
    const avgUtilization = gameState.departments.length > 0 
      ? gameState.departments.reduce((sum, d) => sum + d.utilization, 0) / gameState.departments.length 
      : 0
    
    // Calculate decision quality based on decision history
    const decisions = gameState.decisions || []
    const goodDecisions = decisions.filter(d => 
      d.type === 'order-release' && 
      gameState.completedOrders.some(o => o.id === d.orderId && o.status === 'completed-on-time')
    ).length
    const decisionQuality = decisions.length > 0 ? (goodDecisions / decisions.length) * 100 : 0
    
    // Customer satisfaction based on rush orders and priority handling
    const rushOrders = completedOrders.filter(o => o.rushOrder)
    const rushOnTime = rushOrders.filter(o => o.status === 'completed-on-time').length
    const customerSatisfaction = rushOrders.length > 0 ? (rushOnTime / rushOrders.length) * 100 : 75
    
    // Problem solving score based on handling of events and bottlenecks
    const problemEvents = gameState.gameEvents.filter(e => 
      e.type === 'equipment-failure' || e.type === 'delivery-delay'
    ).length
    const problemSolvingScore = Math.max(0, 100 - (problemEvents * 10))
    
    return {
      onTimeDeliveryRate: onTimeRate,
      avgLeadTime,
      totalThroughput: totalOrders,
      decisionQuality,
      resourceUtilization: avgUtilization,
      customerSatisfaction,
      problemSolvingScore
    }
  }, [gameState])

  // Generate skill assessments based on performance
  const skillAssessments = useMemo((): SkillAssessment[] => {
    const assessments: SkillAssessment[] = []
    
    // Manufacturing Planning Skills
    assessments.push({
      skill: 'Production Scheduling',
      category: 'Manufacturing Planning',
      currentLevel: Math.min(5, Math.floor(currentSessionMetrics.onTimeDeliveryRate / 20) + 1),
      targetLevel: 4,
      progress: (currentSessionMetrics.onTimeDeliveryRate / 80) * 100,
      evidence: [
        `${currentSessionMetrics.onTimeDeliveryRate.toFixed(1)}% on-time delivery rate`,
        `${gameState.decisions.length} scheduling decisions made`,
        `${gameState.totalOrdersGenerated} orders processed`
      ],
      recommendations: currentSessionMetrics.onTimeDeliveryRate < 80 ? [
        'Focus on improving order prioritization',
        'Consider customer tier when scheduling',
        'Monitor department capacity more closely'
      ] : [
        'Excellent scheduling performance!',
        'Try more complex scenarios to challenge yourself'
      ]
    })
    
    // Capacity Management
    assessments.push({
      skill: 'Capacity Management',
      category: 'Resource Optimization',
      currentLevel: Math.min(5, Math.floor(currentSessionMetrics.resourceUtilization / 15) + 1),
      targetLevel: 4,
      progress: (currentSessionMetrics.resourceUtilization / 85) * 100,
      evidence: [
        `${currentSessionMetrics.resourceUtilization.toFixed(1)}% average utilization`,
        `${gameState.departments.filter(d => d.utilization > 85).length} bottleneck departments identified`,
        `${gameState.departments.filter(d => d.utilization < 50).length} underutilized departments`
      ],
      recommendations: currentSessionMetrics.resourceUtilization < 70 ? [
        'Work on balancing department workloads',
        'Use capacity planning tools more effectively',
        'Consider workload rebalancing opportunities'
      ] : currentSessionMetrics.resourceUtilization > 90 ? [
        'Great utilization, but watch for bottlenecks',
        'Consider expanding capacity for high-demand departments'
      ] : [
        'Good capacity utilization balance',
        'Continue monitoring for optimization opportunities'
      ]
    })
    
    // Customer Service
    assessments.push({
      skill: 'Customer Service Excellence',
      category: 'Customer Management',
      currentLevel: Math.min(5, Math.floor(currentSessionMetrics.customerSatisfaction / 20) + 1),
      targetLevel: 4,
      progress: (currentSessionMetrics.customerSatisfaction / 95) * 100,
      evidence: [
        `${currentSessionMetrics.customerSatisfaction.toFixed(1)}% customer satisfaction`,
        `${gameState.completedOrders.filter(o => o.priority === 'urgent').length} urgent orders handled`,
        `${gameState.completedOrders.filter(o => o.rushOrder).length} rush orders completed`
      ],
      recommendations: currentSessionMetrics.customerSatisfaction < 80 ? [
        'Pay more attention to customer priority levels',
        'Prioritize VIP and premium customers',
        'Improve rush order handling'
      ] : [
        'Excellent customer service focus!',
        'Continue prioritizing customer needs'
      ]
    })
    
    // Decision Making
    assessments.push({
      skill: 'Strategic Decision Making',
      category: 'Management Skills',
      currentLevel: Math.min(5, Math.floor(currentSessionMetrics.decisionQuality / 20) + 1),
      targetLevel: 4,
      progress: (currentSessionMetrics.decisionQuality / 90) * 100,
      evidence: [
        `${currentSessionMetrics.decisionQuality.toFixed(1)}% decision effectiveness`,
        `${gameState.decisions.length} total decisions made`,
        `${gameState.decisions.filter(d => d.canUndo).length} reversible decisions`
      ],
      recommendations: currentSessionMetrics.decisionQuality < 70 ? [
        'Take more time to analyze before making decisions',
        'Use available analytics and forecasting tools',
        'Consider long-term impact of decisions'
      ] : [
        'Strong decision-making skills demonstrated',
        'Continue using data-driven approaches'
      ]
    })
    
    // Problem Solving
    assessments.push({
      skill: 'Crisis Management',
      category: 'Problem Solving',
      currentLevel: Math.min(5, Math.floor(currentSessionMetrics.problemSolvingScore / 20) + 1),
      targetLevel: 3,
      progress: (currentSessionMetrics.problemSolvingScore / 90) * 100,
      evidence: [
        `${gameState.gameEvents.filter(e => e.severity === 'error').length} crisis events encountered`,
        `${gameState.gameEvents.filter(e => e.type === 'equipment-failure').length} equipment failures handled`,
        `${Math.round(currentSessionMetrics.problemSolvingScore)}% crisis resolution score`
      ],
      recommendations: gameState.gameEvents.filter(e => e.severity === 'error').length > 3 ? [
        'Develop better contingency planning',
        'Monitor equipment condition more closely',
        'Use predictive analytics to prevent issues'
      ] : [
        'Good crisis management performance',
        'Continue proactive monitoring'
      ]
    })
    
    return assessments
  }, [currentSessionMetrics, gameState])

  // Generate learning objectives progress
  const learningObjectives = useMemo((): LearningObjective[] => {
    return [
      {
        id: 'obj-1',
        title: 'Master Production Scheduling',
        description: 'Achieve consistent on-time delivery rates above 85%',
        category: 'manufacturing-planning',
        targetProficiency: 85,
        currentProficiency: currentSessionMetrics.onTimeDeliveryRate,
        practiced: gameState.totalOrdersGenerated > 5,
        mastered: currentSessionMetrics.onTimeDeliveryRate >= 85
      },
      {
        id: 'obj-2',
        title: 'Optimize Resource Utilization',
        description: 'Maintain department utilization between 70-85%',
        category: 'capacity-management',
        targetProficiency: 80,
        currentProficiency: currentSessionMetrics.resourceUtilization,
        practiced: gameState.departments.some(d => d.utilization > 60),
        mastered: currentSessionMetrics.resourceUtilization >= 70 && currentSessionMetrics.resourceUtilization <= 85
      },
      {
        id: 'obj-3',
        title: 'Excel in Customer Service',
        description: 'Achieve customer satisfaction above 90%',
        category: 'customer-service',
        targetProficiency: 90,
        currentProficiency: currentSessionMetrics.customerSatisfaction,
        practiced: gameState.completedOrders.some(o => o.priority === 'high' || o.priority === 'urgent'),
        mastered: currentSessionMetrics.customerSatisfaction >= 90
      },
      {
        id: 'obj-4',
        title: 'Develop Decision-Making Skills',
        description: 'Make effective decisions with 80%+ success rate',
        category: 'optimization',
        targetProficiency: 80,
        currentProficiency: currentSessionMetrics.decisionQuality,
        practiced: gameState.decisions.length > 3,
        mastered: currentSessionMetrics.decisionQuality >= 80
      },
      {
        id: 'obj-5',
        title: 'Handle Crisis Situations',
        description: 'Successfully manage unexpected events and disruptions',
        category: 'crisis-management',
        targetProficiency: 80,
        currentProficiency: currentSessionMetrics.problemSolvingScore,
        practiced: gameState.gameEvents.some(e => e.severity === 'error' || e.severity === 'warning'),
        mastered: currentSessionMetrics.problemSolvingScore >= 80
      }
    ]
  }, [currentSessionMetrics, gameState])

  // Generate achievements based on performance
  const currentAchievements = useMemo((): Achievement[] => {
    const achievements: Achievement[] = []
    
    if (currentSessionMetrics.onTimeDeliveryRate >= 95) {
      achievements.push({
        id: 'perfect-delivery',
        title: 'Perfect Delivery',
        description: 'Achieved 95%+ on-time delivery rate',
        category: 'quality',
        level: 'gold',
        earnedAt: new Date(),
        points: 100
      })
    } else if (currentSessionMetrics.onTimeDeliveryRate >= 85) {
      achievements.push({
        id: 'excellent-delivery',
        title: 'Excellent Delivery',
        description: 'Achieved 85%+ on-time delivery rate',
        category: 'quality',
        level: 'silver',
        earnedAt: new Date(),
        points: 50
      })
    }
    
    if (currentSessionMetrics.resourceUtilization >= 75 && currentSessionMetrics.resourceUtilization <= 85) {
      achievements.push({
        id: 'optimal-utilization',
        title: 'Optimal Utilization',
        description: 'Maintained ideal resource utilization (75-85%)',
        category: 'efficiency',
        level: 'gold',
        earnedAt: new Date(),
        points: 75
      })
    }
    
    if (gameState.totalOrdersGenerated >= 20) {
      achievements.push({
        id: 'volume-processor',
        title: 'Volume Processor',
        description: 'Successfully processed 20+ orders',
        category: 'efficiency',
        level: 'bronze',
        earnedAt: new Date(),
        points: 25
      })
    }
    
    if (currentSessionMetrics.decisionQuality >= 90) {
      achievements.push({
        id: 'master-strategist',
        title: 'Master Strategist',
        description: 'Achieved 90%+ decision effectiveness',
        category: 'decision-making',
        level: 'gold',
        earnedAt: new Date(),
        points: 100
      })
    }
    
    if (gameState.decisions.length >= 10 && currentSessionMetrics.decisionQuality >= 75) {
      achievements.push({
        id: 'decision-maker',
        title: 'Effective Decision Maker',
        description: 'Made 10+ effective decisions',
        category: 'decision-making',
        level: 'silver',
        earnedAt: new Date(),
        points: 50
      })
    }
    
    return achievements
  }, [currentSessionMetrics, gameState])

  const getSkillLevelColor = (level: number) => {
    if (level >= 4) return 'text-green-600 bg-green-100'
    if (level >= 3) return 'text-blue-600 bg-blue-100'
    if (level >= 2) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getAchievementColor = (level: string) => {
    switch (level) {
      case 'gold': return 'text-yellow-600 bg-yellow-100 border-yellow-300'
      case 'silver': return 'text-gray-600 bg-gray-100 border-gray-300'
      case 'bronze': return 'text-orange-600 bg-orange-100 border-orange-300'
      default: return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="text-purple-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-800">Learning Analytics</h3>
          <span className="text-sm text-gray-500">R12: Educational Progress & Feedback</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['overview', 'skills', 'progress', 'achievements', 'feedback'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  selectedView === view
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
          
          {onExportProgress && (
            <button
              onClick={onExportProgress}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Export Progress
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Current Session Summary */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Current Session Performance</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="text-green-600" size={20} />
                    <span className="font-medium text-green-800">Delivery Performance</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage(currentSessionMetrics.onTimeDeliveryRate)}
                  </div>
                  <div className="text-sm text-green-700">On-time delivery rate</div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="text-blue-600" size={20} />
                    <span className="font-medium text-blue-800">Resource Efficiency</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPercentage(currentSessionMetrics.resourceUtilization)}
                  </div>
                  <div className="text-sm text-blue-700">Average utilization</div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="text-purple-600" size={20} />
                    <span className="font-medium text-purple-800">Decision Quality</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPercentage(currentSessionMetrics.decisionQuality)}
                  </div>
                  <div className="text-sm text-purple-700">Effective decisions</div>
                </div>
              </div>
            </div>

            {/* Learning Objectives Progress */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Learning Objectives Progress</h4>
              <div className="space-y-3">
                {learningObjectives.map(obj => (
                  <div key={obj.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{obj.title}</span>
                      <div className="flex items-center gap-2">
                        {obj.practiced && <CheckCircle size={16} className="text-blue-600" />}
                        {obj.mastered && <Star size={16} className="text-yellow-500" />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{obj.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{obj.currentProficiency.toFixed(1)}/{obj.targetProficiency}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              obj.mastered ? 'bg-green-500' : obj.practiced ? 'bg-blue-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${Math.min((obj.currentProficiency / obj.targetProficiency) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        obj.mastered ? 'bg-green-100 text-green-800' : 
                        obj.practiced ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {obj.mastered ? 'Mastered' : obj.practiced ? 'Practicing' : 'Not Started'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'skills' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800">Skill Assessment</h4>
            <div className="space-y-4">
              {skillAssessments.map((skill, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-800">{skill.skill}</h5>
                      <p className="text-sm text-gray-600">{skill.category}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(skill.currentLevel)}`}>
                      Level {skill.currentLevel}/5
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress to Level {skill.targetLevel}</span>
                      <span>{skill.progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-purple-500 rounded-full transition-all"
                        style={{ width: `${Math.min(skill.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Evidence:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {skill.evidence.map((evidence, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <CheckCircle size={12} className="text-green-600" />
                            {evidence}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Recommendations:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {skill.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <TrendingUp size={12} className="text-blue-600" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'achievements' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800">Achievements Earned</h4>
            <div className="grid grid-cols-2 gap-4">
              {currentAchievements.map(achievement => (
                <div key={achievement.id} className={`border-2 rounded-lg p-4 ${getAchievementColor(achievement.level)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Award size={24} className={`${achievement.level === 'gold' ? 'text-yellow-600' : 
                                                   achievement.level === 'silver' ? 'text-gray-600' : 
                                                   'text-orange-600'}`} />
                    <div>
                      <h5 className="font-semibold">{achievement.title}</h5>
                      <p className="text-sm opacity-80">{achievement.level.toUpperCase()}</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3">{achievement.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Category: {achievement.category}</span>
                    <span className="font-bold">+{achievement.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
            
            {currentAchievements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Award size={48} className="mx-auto mb-4 opacity-50" />
                <p>Keep playing to earn achievements!</p>
                <p className="text-sm">Complete orders and improve your performance to unlock rewards.</p>
              </div>
            )}
          </div>
        )}

        {selectedView === 'feedback' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800">Personalized Feedback</h4>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 mb-2">Strengths Identified</h5>
              <ul className="space-y-1 text-blue-700">
                {currentSessionMetrics.onTimeDeliveryRate > 80 && (
                  <li>• Excellent delivery performance - customers are happy!</li>
                )}
                {currentSessionMetrics.resourceUtilization > 70 && currentSessionMetrics.resourceUtilization < 90 && (
                  <li>• Good resource utilization - you're balancing efficiency well</li>
                )}
                {currentSessionMetrics.decisionQuality > 75 && (
                  <li>• Strong decision-making skills demonstrated</li>
                )}
                {gameState.decisions.length > 5 && (
                  <li>• Active engagement with game features and tools</li>
                )}
              </ul>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-800 mb-2">Areas for Improvement</h5>
              <ul className="space-y-1 text-yellow-700">
                {currentSessionMetrics.onTimeDeliveryRate < 70 && (
                  <li>• Focus on improving on-time delivery rates through better scheduling</li>
                )}
                {currentSessionMetrics.resourceUtilization < 60 && (
                  <li>• Work on increasing resource utilization to improve efficiency</li>
                )}
                {currentSessionMetrics.resourceUtilization > 90 && (
                  <li>• High utilization detected - watch for bottlenecks and overload</li>
                )}
                {currentSessionMetrics.customerSatisfaction < 80 && (
                  <li>• Improve customer satisfaction by prioritizing urgent and rush orders</li>
                )}
                {gameState.decisions.length < 3 && (
                  <li>• Try using more game features like scheduling and optimization tools</li>
                )}
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 mb-2">Next Steps</h5>
              <ul className="space-y-1 text-green-700">
                <li>• Try a more complex scenario to challenge your skills</li>
                <li>• Experiment with the capacity planning and route optimization tools</li>
                <li>• Focus on maintaining consistent performance across all metrics</li>
                <li>• Practice handling crisis situations and unexpected events</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

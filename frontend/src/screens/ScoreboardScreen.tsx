import { useState, useMemo } from "react";
import { Trophy, ArrowUp, Target, Medal } from "lucide-react";

interface ScoreboardEntry {
  rank: number;
  name: string;
  score: number;
  level: number;
  completionTime?: number;
  difficulty: "easy" | "medium" | "hard";
  timestamp?: Date;
  avatar?: string;
}

interface ScoreboardScreenProps {
  onNavigate?: (screen: string) => void;
}

export default function ScoreboardScreen({ onNavigate: _onNavigate }: ScoreboardScreenProps) {
  // Sample leaderboard data - in production this would come from a backend
  const [selectedLevel, setSelectedLevel] = useState(1);
  
  const leaderboardData: ScoreboardEntry[] = [
    { rank: 1, name: "Roger Smeets", score: 1054, level: 1, difficulty: "easy", avatar: "😊" },
    { rank: 2, name: "Simon Simone", score: 987, level: 1, difficulty: "easy", avatar: "😌" },
    { rank: 3, name: "Jesse Javer", score: 940, level: 1, difficulty: "easy", avatar: "😎" },
    { rank: 4, name: "Johannes Van de Berg", score: 901, level: 1, difficulty: "easy", avatar: "😊" },
    { rank: 5, name: "Rodrigo Paters", score: 889, level: 1, difficulty: "easy", avatar: "😄" },
    { rank: 6, name: "Emma Wilson", score: 876, level: 1, difficulty: "medium", avatar: "😊" },
    { rank: 7, name: "Michael Chen", score: 845, level: 1, difficulty: "medium", avatar: "😌" },
    { rank: 8, name: "Sarah Johnson", score: 834, level: 1, difficulty: "hard", avatar: "🤓" },
  ];

  const levels = [1, 2, 3];
  
  const filteredLeaderboard = useMemo(() => {
    return leaderboardData.filter(entry => entry.level === selectedLevel);
  }, [selectedLevel]);

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-50 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "hard":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getScoreBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-lg";
    if (rank === 2) return "bg-gradient-to-br from-gray-300 to-gray-500 text-white";
    if (rank === 3) return "bg-gradient-to-br from-orange-300 to-orange-500 text-white";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header Section */}
      <div className="relative px-8 py-12 bg-white border-b-2 border-blue-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mr-6">
                <Trophy size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Leaderboard</h1>
                <p className="text-gray-600 mt-1">See how you compare with other players</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-8 py-12 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Level Selection */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Select Level</h2>
            <div className="flex gap-3 flex-wrap">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedLevel === level
                      ? "bg-blue-600 text-white shadow-lg scale-105"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  Level {level}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Leaderboard lvl {selectedLevel}</h3>
              <p className="text-sm text-gray-600 mt-1">{filteredLeaderboard.length} Players</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">Difficulty</th>
                    <th className="px-8 py-4 text-right text-sm font-semibold text-gray-700">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.length > 0 ? (
                    filteredLeaderboard.map((entry, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                          entry.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-transparent" : ""
                        }`}
                      >
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getScoreBadgeColor(entry.rank)}`}>
                              {getRankMedal(entry.rank) || entry.rank}
                            </div>
                            <span className="font-semibold text-gray-900">{entry.rank}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xl">
                              {entry.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{entry.name}</p>
                              <p className="text-xs text-gray-500">Player</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(entry.difficulty)}`}>
                            {entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold text-lg text-gray-900">{entry.score}</span>
                            {entry.rank <= 3 && <Trophy size={18} className="text-yellow-500" />}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Target size={48} className="text-gray-300 mb-4" />
                          <p>No scores yet for this level</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Top Score</h4>
                <Trophy size={24} className="text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {filteredLeaderboard.length > 0 ? filteredLeaderboard[0].score : "N/A"}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {filteredLeaderboard.length > 0 ? `by ${filteredLeaderboard[0].name}` : "No data"}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Average Score</h4>
                <Target size={24} className="text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {filteredLeaderboard.length > 0
                  ? Math.round(
                      filteredLeaderboard.reduce((sum, entry) => sum + entry.score, 0) /
                        filteredLeaderboard.length
                    )
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-600 mt-2">{filteredLeaderboard.length} players</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Score Range</h4>
                <ArrowUp size={24} className="text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {filteredLeaderboard.length > 0
                  ? Math.max(...filteredLeaderboard.map(e => e.score)) -
                    Math.min(...filteredLeaderboard.map(e => e.score))
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-600 mt-2">Highest vs lowest</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Medal size={32} className="text-blue-600 mt-1" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How Scoring Works</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span><strong>On-Time Delivery:</strong> Late orders give half the points</span>
                  </li>
                    <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span><strong>Difficulty Multiplier:</strong> Higher levels offer greater score potential</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

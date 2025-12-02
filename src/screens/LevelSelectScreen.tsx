import React from "react";
import { Play, Download, ArrowLeft } from "lucide-react";
import type { ScheduledOrder } from "../types";
import level1 from "../../data/levels/level-1.json";
import levelLoader from "../utils/levelLoader";

interface LevelSelectScreenProps {
  onBack: () => void;
  onSelectLevel: (scheduledOrders: ScheduledOrder[]) => void;
}

export default function LevelSelectScreen({ onBack, onSelectLevel }: LevelSelectScreenProps) {
  // For now a single example level 
  // TODO: extend and load from external source
  const exampleLevels = [
    {
      id: "level-1",
      title: "Intro Level - Simple Flow",
      description: "A short level with 3 orders appearing early in the session.",
      data: level1,
    },
  ];

  const handleSelect = (levelData: any) => {
    try {
      const scheduled = levelLoader.loadLevelFromObject(levelData, 30);
      onSelectLevel(scheduled);
    } catch (err) {
      console.error("Failed to load level:", err);
      alert("Failed to load level — check console for details.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Level Select</h1>
            <p className="text-sm text-gray-600">Choose a predefined level to practice specific scenarios.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exampleLevels.map((lvl) => (
            <div key={lvl.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{lvl.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{lvl.description}</p>
                </div>
                <div className="text-xs text-gray-500">{lvl.id}</div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <div>Duration</div>
                  <div>~15 min</div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div>Difficulty</div>
                  <div>Beginner</div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => handleSelect(lvl.data)}
                  className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play size={16} />
                  <span>Load Level</span>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const blob = new Blob([JSON.stringify(lvl.data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${lvl.id}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download size={14} />
                  <span>Download JSON</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="fixed left-6 md:left-24 bottom-6 z-50">
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
            title="Back"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}

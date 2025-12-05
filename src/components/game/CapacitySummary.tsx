import type { GameState } from "../../types";

interface Props {
  gameState: GameState;
}

export default function CapacitySummary({ gameState }: Props) {
  const departments = gameState.departments;

  const avgUtilization = Math.round(
    departments.reduce((s, d) => s + (d.utilization || 0), 0) /
      Math.max(1, departments.length)
  );

  const availableCapacity = departments.reduce((s, d) => {
    const max = d.capacity || 0;
    const load = d.queue.length + (d.inProcess ? 1 : 0);
    return s + Math.max(0, max - load);
  }, 0);

  const bottlenecks = departments.filter((d) => (d.utilization || 0) > 90)
    .length;

  const avgEfficiency = (
    departments.reduce((s, d) => s + (d.efficiency || 1), 0) /
    Math.max(1, departments.length)
  ).toFixed(2);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 w-full">
      <h4 className="text-sm font-semibold text-gray-800 mb-2">
        Capacity Summary
      </h4>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="p-2">
          <div className="text-xs text-gray-500">Avg Utilization</div>
          <div className="font-medium text-lg">{avgUtilization}%</div>
        </div>

        <div className="p-2">
          <div className="text-xs text-gray-500">Available Capacity</div>
          <div className="font-medium text-lg">{availableCapacity}</div>
        </div>

        <div className="p-2">
          <div className="text-xs text-gray-500">Bottlenecks</div>
          <div className="font-medium text-lg">{bottlenecks}</div>
        </div>

        <div className="p-2">
          <div className="text-xs text-gray-500">Avg Efficiency</div>
          <div className="font-medium text-lg">{avgEfficiency}x</div>
        </div>
      </div>
    </div>
  );
}

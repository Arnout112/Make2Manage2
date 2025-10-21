import React from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import type { Order } from "../../types";

interface RouteProgressIndicatorProps {
  order: Order;
  departmentNames?: { [key: number]: string };
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

const RouteProgressIndicator: React.FC<RouteProgressIndicatorProps> = ({
  order,
  departmentNames = {
    1: "Assembly",
    2: "Packaging",
    3: "Quality Control",
    4: "Machining",
  },
  size = "sm",
  showLabels = false,
}) => {
  const sizeClasses = {
    sm: {
      container: "flex items-center space-x-1",
      circle: "w-5 h-5",
      text: "text-xs",
      arrow: 12,
    },
    md: {
      container: "flex items-center space-x-2",
      circle: "w-6 h-6",
      text: "text-sm",
      arrow: 14,
    },
    lg: {
      container: "flex items-center space-x-3",
      circle: "w-8 h-8",
      text: "text-base",
      arrow: 16,
    },
  };

  const classes = sizeClasses[size];

  // Get number of completed steps based on timestamps with end dates
  const completedSteps = order.timestamps.filter(
    (timestamp) => timestamp.end
  ).length;

  return (
    <div className={classes.container}>
      {order.route.map((deptId, index) => {
        const isCompleted = index < completedSteps;
        const isCurrent =
          index === completedSteps && order.status === "processing";

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`
                  ${
                    classes.circle
                  } rounded-full flex items-center justify-center font-medium transition-all
                  ${
                    isCompleted
                      ? "bg-green-100 text-green-700 border-2 border-green-300"
                      : isCurrent
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-300 ring-2 ring-blue-200"
                      : "bg-gray-100 text-gray-500 border-2 border-gray-200"
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle size={classes.arrow} />
                ) : (
                  <span className={classes.text}>{deptId}</span>
                )}
              </div>

              {/* Department Label */}
              {showLabels && (
                <span
                  className={`
                    ${classes.text} mt-1 text-center
                    ${
                      isCurrent
                        ? "text-blue-700 font-medium"
                        : isCompleted
                        ? "text-green-700"
                        : "text-gray-500"
                    }
                  `}
                >
                  {departmentNames[deptId] || `Dept ${deptId}`}
                </span>
              )}
            </div>

            {/* Arrow between steps */}
            {index < order.route.length - 1 && (
              <ArrowRight
                size={classes.arrow}
                className={`
                  ${isCompleted ? "text-green-400" : "text-gray-300"}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default RouteProgressIndicator;

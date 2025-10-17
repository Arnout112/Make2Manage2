import React from "react";
import { ArrowRight, Circle, CheckCircle, Clock } from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  route: number[];
  currentStep: number;
  status: "pending" | "in-progress" | "completed";
  departmentQueue?: number[];
}

interface OrderProcessingGuideProps {
  orders: Order[];
  onOrderClick: (orderId: string) => void;
  departmentNames?: { [key: number]: string };
  className?: string;
}

const OrderProcessingGuide: React.FC<OrderProcessingGuideProps> = ({
  orders,
  onOrderClick,
  departmentNames = {
    1: "Assembly",
    2: "Packaging",
    3: "Quality Control",
    4: "Machining",
  },
  className,
}) => {
  const getStepStatus = (order: Order, stepIndex: number) => {
    if (stepIndex < order.currentStep) return "completed";
    if (stepIndex === order.currentStep) return "current";
    return "pending";
  };

  const getOrderPriority = (order: Order) => {
    // Orders that are ready for next step have higher priority
    if (order.status === "in-progress") return "high";
    if (order.status === "pending") return "medium";
    return "low";
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (
      priorityOrder[getOrderPriority(a)] - priorityOrder[getOrderPriority(b)]
    );
  });

  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${
        className || ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Order Processing Guide
        </h3>
        <div className="text-sm text-gray-500">
          Click orders ready for next step
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedOrders.map((order) => {
          const isReadyForNext = order.status === "in-progress";
          const nextDepartment = order.route[order.currentStep];

          return (
            <div
              key={order.id}
              onClick={() => isReadyForNext && onOrderClick(order.id)}
              className={`p-4 border rounded-lg transition-all cursor-pointer ${
                isReadyForNext
                  ? "border-blue-300 bg-blue-50 hover:bg-blue-100 shadow-sm"
                  : order.status === "completed"
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-800">
                    Order #{order.id}
                  </span>
                  <span className="text-sm text-gray-600">
                    - {order.customerName}
                  </span>
                </div>

                {isReadyForNext && (
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Clock size={16} />
                    <span className="text-sm font-medium">Ready</span>
                  </div>
                )}
              </div>

              {/* Route Progress */}
              <div className="flex items-center space-x-2">
                {order.route.map((deptId, index) => {
                  const status = getStepStatus(order, index);

                  return (
                    <React.Fragment key={index}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            status === "completed"
                              ? "bg-green-100 text-green-700 border-2 border-green-300"
                              : status === "current"
                              ? "bg-blue-100 text-blue-700 border-2 border-blue-300 ring-2 ring-blue-200"
                              : "bg-gray-100 text-gray-500 border-2 border-gray-200"
                          }`}
                        >
                          {status === "completed" ? (
                            <CheckCircle size={16} />
                          ) : (
                            deptId
                          )}
                        </div>
                        <span
                          className={`text-xs mt-1 ${
                            status === "current"
                              ? "text-blue-700 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {departmentNames[deptId]}
                        </span>
                      </div>

                      {index < order.route.length - 1 && (
                        <ArrowRight
                          size={16}
                          className={`${
                            status === "completed"
                              ? "text-green-400"
                              : "text-gray-300"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Next Action */}
              {isReadyForNext && nextDepartment && (
                <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Next:</span> Move to
                    Department {nextDepartment} (
                    {departmentNames[nextDepartment]})
                  </p>
                </div>
              )}

              {order.status === "completed" && (
                <div className="mt-3 p-2 bg-green-100 rounded border border-green-200">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ Order Complete
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No orders to process</p>
            <p className="text-sm">Start the game to begin receiving orders</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderProcessingGuide;

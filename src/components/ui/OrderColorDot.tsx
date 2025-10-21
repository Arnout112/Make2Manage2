import React from "react";
import { getOrderColor } from "../../utils/orderColors";

interface OrderColorDotProps {
  orderId: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

/**
 * OrderColorDot - Visual tracking component for orders
 * Educational Focus: Consistent visual identification across manufacturing workflow
 */
export const OrderColorDot: React.FC<OrderColorDotProps> = ({
  orderId,
  size = "sm",
  className = "",
}) => {
  const color = getOrderColor(orderId);
  const sizeClasses = {
    xs: "w-2 h-2",
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${color.dot} rounded-full ${className}`}
      title={`Order ${orderId} tracking color`}
    />
  );
};

export default OrderColorDot;

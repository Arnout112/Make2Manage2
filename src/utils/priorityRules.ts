/**
 * Priority Rule Logic for Department Queue Management
 * Educational Focus: Teaching different scheduling rules and their impact
 */

import type { Order, PriorityRule } from '../types';

/**
 * Sort orders based on the specified priority rule
 * @param orders - Array of orders to sort
 * @param rule - Priority rule to apply (FIFO, EDD, SPT)
 * @returns Sorted array of orders
 */
export const sortOrdersByPriorityRule = (orders: Order[], rule: PriorityRule): Order[] => {
  const sortedOrders = [...orders];

  switch (rule) {
    case 'FIFO': // First In, First Out
      return sortedOrders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    case 'EDD': // Earliest Due Date
      return sortedOrders.sort((a, b) => {
        // Use dueGameMinutes if available, otherwise fall back to dueDate
        const aDue = a.dueGameMinutes ?? (a.dueDate ? a.dueDate.getTime() : Number.MAX_SAFE_INTEGER);
        const bDue = b.dueGameMinutes ?? (b.dueDate ? b.dueDate.getTime() : Number.MAX_SAFE_INTEGER);
        
        const dueDateDiff = aDue - bDue;
        if (dueDateDiff !== 0) return dueDateDiff;
        
        // If due dates are equal, use priority as tiebreaker
        const priorityOrder = { 'urgent': 4, 'high': 3, 'normal': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    case 'SPT': // Shortest Processing Time
      return sortedOrders.sort((a, b) => {
        // Use standard processing time for current operation
        const aTime = a.processingTime || 30; // Default 30 minutes if not set
        const bTime = b.processingTime || 30;
        
        const timeDiff = aTime - bTime;
        if (timeDiff !== 0) return timeDiff;
        
        // If processing times are equal, use priority as tiebreaker
        const priorityOrder = { 'urgent': 4, 'high': 3, 'normal': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    default:
      return sortedOrders;
  }
};

/**
 * Get the next order to process from a department queue based on priority rule
 * @param queue - Department queue of orders
 * @param rule - Priority rule to apply
 * @returns Next order to process or null if queue is empty
 */
export const getNextOrderToProcess = (queue: Order[], rule: PriorityRule): Order | null => {
  if (queue.length === 0) return null;
  
  const sortedQueue = sortOrdersByPriorityRule(queue, rule);
  return sortedQueue[0];
};

/**
 * Add an order to a department queue and automatically sort based on priority rule
 * @param queue - Current department queue
 * @param order - Order to add
 * @param rule - Priority rule for this department
 * @returns Updated queue sorted by priority rule
 */
export const addOrderToQueue = (queue: Order[], order: Order, rule: PriorityRule): Order[] => {
  const newQueue = [...queue, order];
  return sortOrdersByPriorityRule(newQueue, rule);
};

/**
 * Remove an order from a department queue
 * @param queue - Current department queue
 * @param orderId - ID of order to remove
 * @returns Updated queue with order removed
 */
export const removeOrderFromQueue = (queue: Order[], orderId: string): Order[] => {
  return queue.filter(order => order.id !== orderId);
};

/**
 * Get description of priority rule for educational purposes
 * @param rule - Priority rule
 * @returns Human-readable description
 */
export const getPriorityRuleDescription = (rule: PriorityRule): string => {
  switch (rule) {
    case 'FIFO':
      return 'First In, First Out - Orders are processed in the order they arrive at the department';
    case 'EDD':
      return 'Earliest Due Date - Orders with the earliest due dates are processed first';
    case 'SPT':
      return 'Shortest Processing Time - Orders with the shortest processing times are processed first';
    default:
      return 'Unknown priority rule';
  }
};

/**
 * Get the educational benefit/drawback of each priority rule
 * @param rule - Priority rule
 * @returns Educational insights about the rule
 */
export const getPriorityRuleInsights = (rule: PriorityRule): {
  benefits: string[];
  drawbacks: string[];
  bestFor: string;
} => {
  switch (rule) {
    case 'FIFO':
      return {
        benefits: [
          'Simple and fair - easy to understand and implement',
          'Good for customer satisfaction (no order skipping)',
          'Predictable wait times for customers'
        ],
        drawbacks: [
          'May not optimize delivery performance',
          'Does not consider urgency or due dates',
          'Can lead to late deliveries for urgent orders'
        ],
        bestFor: 'Stable environments with consistent order types and processing times'
      };
    
    case 'EDD':
      return {
        benefits: [
          'Minimizes late deliveries and improves on-time performance',
          'Considers customer deadlines directly',
          'Good for meeting service level agreements'
        ],
        drawbacks: [
          'May cause long wait times for orders with distant due dates',
          'Can be disrupted by rush/urgent orders',
          'May not optimize overall throughput'
        ],
        bestFor: 'Customer-focused environments where on-time delivery is critical'
      };
    
    case 'SPT':
      return {
        benefits: [
          'Maximizes throughput and productivity',
          'Minimizes average waiting time across all orders',
          'Good for reducing work-in-progress inventory'
        ],
        drawbacks: [
          'Large/complex orders may wait indefinitely',
          'May not meet customer due dates',
          'Can create unfairness for complex orders'
        ],
        bestFor: 'High-volume environments focused on maximizing output and efficiency'
      };
    
    default:
      return {
        benefits: [],
        drawbacks: [],
        bestFor: 'Unknown'
      };
  }
};

/**
 * Calculate expected impact of switching priority rules
 * @param currentQueue - Current queue of orders
 * @param fromRule - Current priority rule
 * @param toRule - New priority rule to switch to
 * @returns Analysis of the impact
 */
export const analyzePriorityRuleSwitch = (
  currentQueue: Order[], 
  fromRule: PriorityRule, 
  toRule: PriorityRule
): {
  reorderingRequired: boolean;
  ordersAffected: number;
  estimatedImpact: string;
} => {
  if (fromRule === toRule || currentQueue.length === 0) {
    return {
      reorderingRequired: false,
      ordersAffected: 0,
      estimatedImpact: 'No change required'
    };
  }

  const currentOrder = sortOrdersByPriorityRule(currentQueue, fromRule);
  const newOrder = sortOrdersByPriorityRule(currentQueue, toRule);
  
  let ordersAffected = 0;
  for (let i = 0; i < currentOrder.length; i++) {
    if (currentOrder[i].id !== newOrder[i].id) {
      ordersAffected++;
    }
  }

  let estimatedImpact = '';
  if (ordersAffected === 0) {
    estimatedImpact = 'No immediate impact - queue order remains the same';
  } else if (ordersAffected <= currentQueue.length * 0.3) {
    estimatedImpact = 'Minor reordering - some orders will shift positions';
  } else if (ordersAffected <= currentQueue.length * 0.7) {
    estimatedImpact = 'Moderate reordering - significant queue restructuring';
  } else {
    estimatedImpact = 'Major reordering - complete queue restructuring required';
  }

  return {
    reorderingRequired: ordersAffected > 0,
    ordersAffected,
    estimatedImpact
  };
};
/**
 * Date Utilities for Make2Manage Educational Game
 * Educational Focus: Teaching time management in manufacturing
 */

/**
 * Format due time for orders based on priority and game context
 */
export function formatOrderDueTime(
  dueGameMinutes: number | undefined,
  priority: "low" | "normal" | "high" | "urgent",
  currentElapsedMinutes: number
): { display: string; isOverdue: boolean; timeRemaining: number } {
  if (dueGameMinutes === undefined) {
    return { display: "No due date", isOverdue: false, timeRemaining: 0 };
  }

  const timeRemaining = dueGameMinutes - currentElapsedMinutes;
  const isOverdue = timeRemaining < 0;

  const priorityLabels = {
    urgent: "URGENT",
    high: "HIGH",
    normal: "NORMAL",
    low: "LOW",
  };

  if (isOverdue) {
    return {
      display: `OVERDUE by ${Math.abs(timeRemaining).toFixed(0)}min`,
      isOverdue: true,
      timeRemaining,
    };
  } else if (timeRemaining < 1) {
    return {
      display: `Due NOW (${priorityLabels[priority]})`,
      isOverdue: false,
      timeRemaining,
    };
  } else {
    return {
      display: `Due in ${timeRemaining.toFixed(0)}min (${
        priorityLabels[priority]
      })`,
      isOverdue: false,
      timeRemaining,
    };
  }
}

/**
 * Format date for display in various contexts
 */
export function formatDate(
  date: string | Date,
  format: "short" | "long" | "time" | "relative" = "short"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  switch (format) {
    case "short":
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    case "long":
      return dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    case "time":
      return dateObj.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

    case "relative":
      if (diffDays === 0) {
        return "Today";
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays === -1) {
        return "Tomorrow";
      } else if (diffDays > 0) {
        return `${diffDays} days ago`;
      } else {
        return `In ${Math.abs(diffDays)} days`;
      }

    default:
      return dateObj.toLocaleDateString();
  }
}

/**
 * Educational function: Calculate days until due date
 * Teaching: Lead time management and urgency assessment
 */
export function getDaysUntilDue(dueDate: string | Date): number {
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const now = new Date();

  // Set time to start of day for accurate day calculation
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Educational function: Determine urgency level based on days remaining
 * Teaching: Priority classification in manufacturing scheduling
 */
export function getUrgencyLevel(
  dueDate: string | Date
): "overdue" | "critical" | "urgent" | "normal" | "future" {
  const daysUntil = getDaysUntilDue(dueDate);

  if (daysUntil < 0) return "overdue";
  if (daysUntil <= 1) return "critical";
  if (daysUntil <= 3) return "urgent";
  if (daysUntil <= 7) return "normal";
  return "future";
}

/**
 * Educational function: Calculate working days between dates
 * Teaching: Production planning with business days consideration
 */
export function getWorkingDaysBetween(
  startDate: string | Date,
  endDate: string | Date
): number {
  const start =
    typeof startDate === "string" ? new Date(startDate) : new Date(startDate);
  const end =
    typeof endDate === "string" ? new Date(endDate) : new Date(endDate);

  let workingDays = 0;
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    // Monday = 1, Tuesday = 2, ..., Friday = 5 (exclude weekends)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}

/**
 * Educational function: Add working days to a date
 * Teaching: Production scheduling with business calendar
 */
export function addWorkingDays(
  startDate: string | Date,
  workingDays: number
): Date {
  const date =
    typeof startDate === "string" ? new Date(startDate) : new Date(startDate);
  let addedDays = 0;

  while (addedDays < workingDays) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();

    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }

  return date;
}

/**
 * Educational function: Format duration in hours to human readable
 * Teaching: Time estimation and communication
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours < 8) {
    return `${hours.toFixed(1)} hours`;
  } else {
    const days = Math.floor(hours / 8);
    const remainingHours = hours % 8;

    if (remainingHours === 0) {
      return `${days} ${days === 1 ? "day" : "days"}`;
    } else {
      return `${days}d ${remainingHours.toFixed(1)}h`;
    }
  }
}

/**
 * Educational function: Get time period label for analytics
 * Teaching: Performance measurement periods
 */
export function getTimePeriodLabel(date: Date): string {
  const year = date.getFullYear();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const week = getWeekNumber(date);

  return `${month} ${year} (Week ${week})`;
}

/**
 * Get ISO week number for a date
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Educational function: Check if delivery date is achievable
 * Teaching: Realistic promise date setting
 */
export function isDeliveryDateAchievable(
  currentDate: Date,
  requestedDate: string | Date,
  estimatedProductionHours: number,
  availableCapacityPerDay: number = 8
): {
  achievable: boolean;
  earliestPossible: Date;
  workingDaysNeeded: number;
  message: string;
} {
  const requested =
    typeof requestedDate === "string" ? new Date(requestedDate) : requestedDate;
  const workingDaysNeeded = Math.ceil(
    estimatedProductionHours / availableCapacityPerDay
  );
  const earliestPossible = addWorkingDays(currentDate, workingDaysNeeded);

  const achievable = requested >= earliestPossible;

  return {
    achievable,
    earliestPossible,
    workingDaysNeeded,
    message: achievable
      ? "Delivery date is achievable with current capacity"
      : `Requested date is too early. Earliest possible: ${formatDate(
          earliestPossible
        )}`,
  };
}

/**
 * Educational function: Calculate lead time variance
 * Teaching: Performance analysis and continuous improvement
 */
export function calculateLeadTimeVariance(
  promisedDate: string | Date,
  actualDate: string | Date
): {
  varianceDays: number;
  variancePercentage: number;
  status: "early" | "on-time" | "late";
  message: string;
} {
  const promised =
    typeof promisedDate === "string" ? new Date(promisedDate) : promisedDate;
  const actual =
    typeof actualDate === "string" ? new Date(actualDate) : actualDate;

  const diffMs = actual.getTime() - promised.getTime();
  const varianceDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Calculate percentage based on original lead time
  const leadTimeMs = promised.getTime() - new Date().getTime();
  const leadTimeDays = Math.max(
    1,
    Math.round(leadTimeMs / (1000 * 60 * 60 * 24))
  );
  const variancePercentage = (varianceDays / leadTimeDays) * 100;

  let status: "early" | "on-time" | "late";
  let message: string;

  if (varianceDays < -1) {
    status = "early";
    message = `Delivered ${Math.abs(varianceDays)} days early`;
  } else if (varianceDays > 1) {
    status = "late";
    message = `Delivered ${varianceDays} days late`;
  } else {
    status = "on-time";
    message = "Delivered on time";
  }

  return {
    varianceDays,
    variancePercentage: Math.round(variancePercentage),
    status,
    message,
  };
}

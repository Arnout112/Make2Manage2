import type { ScheduledOrder, Order } from "../types";

type RawScheduledOrder = {
  order: Partial<Order> & { createdAt?: string | number | Date };
  // Accept a few shorthand time properties for authoring convenience
  releaseTimeMs?: number; // absolute ms from game start
  releaseTime?: number; // either ms (large) or minutes (small) depending on authoring
  releaseTimeMinutes?: number;
};

// Helper: convert an authored time field into milliseconds (absolute from game start)
const toReleaseMs = (
  raw: RawScheduledOrder,
  sessionDurationMinutes: number
): number => {
  const sessionMs = sessionDurationMinutes * 60 * 1000;

  if (typeof raw.releaseTimeMs === "number") {
    return Math.max(0, Math.min(sessionMs, raw.releaseTimeMs));
  }

  if (typeof raw.releaseTime === "number") {
    // Heuristic: values less than 1000 likely represent minutes (e.g., 5)
    if (raw.releaseTime > 1000) {
      // assume ms
      return Math.max(0, Math.min(sessionMs, raw.releaseTime));
    }
    // treat as minutes
    return Math.max(0, Math.min(sessionMs, Math.round(raw.releaseTime) * 60 * 1000));
  }

  if (typeof raw.releaseTimeMinutes === "number") {
    return Math.max(0, Math.min(sessionMs, Math.round(raw.releaseTimeMinutes) * 60 * 1000));
  }

  throw new Error("Scheduled order missing release time (use releaseTimeMinutes or releaseTimeMs)");
};

// Normalize a single authored order object into a ScheduledOrder suitable for initializeGameState
export function normalizeScheduledOrders(
  rawList: RawScheduledOrder[],
  sessionDurationMinutes = 30
): ScheduledOrder[] {
  const sessionMs = sessionDurationMinutes * 60 * 1000;

  return (
    rawList || []
  )
    .map((raw, idx) => {
      const releaseTime = toReleaseMs(raw, sessionDurationMinutes);

      const order: Order = {
        // minimal defaults; keep any provided fields
        id: raw.order.id || `LEVEL-${String(idx + 1).padStart(3, "0")}`,
        customerId: raw.order.customerId || "CUST-LEVEL",
        customerName: raw.order.customerName || "Level Customer",
        priority: (raw.order.priority as any) || "normal",
        orderValue: raw.order.orderValue || 1000,
        dueGameMinutes: raw.order.dueGameMinutes,
        route: (raw.order.route as number[]) || [1],
        currentStepIndex: raw.order.currentStepIndex ?? -1,
        status: (raw.order.status as any) || "queued",
        timestamps: (raw.order.timestamps as any) || [],
        reworkCount: raw.order.reworkCount || 0,
        createdAt: raw.order.createdAt ? new Date(raw.order.createdAt) : new Date(),
        slaStatus: raw.order.slaStatus || "on-track",
        // Ensure processingTime is milliseconds. Accept minutes authored as small numbers.
        processingTime:
          typeof raw.order.processingTime === "number"
            ? raw.order.processingTime > 1000
              ? raw.order.processingTime
              : raw.order.processingTime * 60 * 1000
            : raw.order.processingTime,
        processingTimeRemaining:
          typeof raw.order.processingTimeRemaining === "number"
            ? raw.order.processingTimeRemaining > 1000
              ? raw.order.processingTimeRemaining
              : raw.order.processingTimeRemaining * 60 * 1000
            : raw.order.processingTimeRemaining,
        isHalfOrder: raw.order.isHalfOrder,
        halfOrderReason: raw.order.halfOrderReason,
        processingTimeMultiplier: raw.order.processingTimeMultiplier,
        specialInstructions: raw.order.specialInstructions,
        rushOrder: raw.order.rushOrder,
      } as Order;

      return {
        order,
        releaseTime: Math.max(0, Math.min(sessionMs, releaseTime)),
      } as ScheduledOrder;
    })
    .sort((a, b) => a.releaseTime - b.releaseTime);
}

export function loadLevelFromObject(levelObj: { scheduledOrders?: RawScheduledOrder[] }, sessionDurationMinutes = 30) {
  if (!levelObj || !Array.isArray(levelObj.scheduledOrders)) {
    throw new Error("Invalid level object: expected { scheduledOrders: [...] }");
  }
  return normalizeScheduledOrders(levelObj.scheduledOrders, sessionDurationMinutes);
}

export default {
  normalizeScheduledOrders,
  loadLevelFromObject,
};

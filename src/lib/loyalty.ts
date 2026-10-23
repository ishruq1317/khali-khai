/**
 * Loyalty Program & First-Order Discount Engine for খালি খাই (Khali Khai)
 * Implements:
 * 1. 15-Orders-in-a-month threshold in Asia/Dhaka timezone -> 25% Delivery Discount next month.
 * 2. Automatic 30-day / calendar month reset to 0 orders complete and 15 to go.
 * 3. First-Order discount (up to ৳50 off delivery for new customers on their FIRST order only).
 */

import { prisma } from "./prisma";

export interface CustomerLoyaltyStatus {
  currentMonthOrdersCount: number;
  thresholdTarget: number; // 15 orders within 30 days / month
  remainingOrdersNeeded: number;
  thresholdMet: boolean;
  discountPercentageEarned: number; // e.g. 25%
  isEligibleForDiscountThisMonth: boolean;
  benefitStartDate?: string;
  benefitExpiryDate?: string;
  totalHistoricalOrders: number;
  isFirstOrderEligible: boolean;
}

/**
 * Gets the current month string in Asia/Dhaka timezone (e.g. "2026-10")
 */
export function getDhakaMonthYear(date = new Date()): string {
  const dhakaFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
  });
  const parts = dhakaFormatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  return `${year}-${month}`;
}

/**
 * Gets the previous month string in Asia/Dhaka timezone (e.g. "2026-09")
 */
export function getPreviousDhakaMonthYear(date = new Date()): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() - 1);
  return getDhakaMonthYear(d);
}

/**
 * Evaluates customer loyalty status and discount eligibility
 */
export async function getCustomerLoyaltyStatus(
  customerId: string
): Promise<CustomerLoyaltyStatus> {
  const currentMonth = getDhakaMonthYear();
  const previousMonth = getPreviousDhakaMonthYear();
  const thresholdTarget = 15; // Target is 15 orders within 30 days / calendar month

  // 1. Check total non-cancelled orders ever placed by this customer ID
  // If user has 0 prior non-cancelled orders, they are eligible for ৳50 first order discount.
  // As soon as 1st order is placed, totalOrdersCount becomes >= 1, disqualifying subsequent orders!
  const totalOrdersCount = await prisma.parentOrder.count({
    where: {
      customerId,
      status: { not: "CANCELLED" },
    },
  });

  const isFirstOrderEligible = totalOrdersCount === 0;

  // 2. Count active/qualifying orders placed in the current month (Asia/Dhaka timezone)
  const startOfMonth = new Date(`${currentMonth}-01T00:00:00.000+06:00`);

  const currentMonthOrdersCount = await prisma.parentOrder.count({
    where: {
      customerId,
      status: { not: "CANCELLED" },
      createdAt: { gte: startOfMonth },
    },
  });

  const thresholdMet = currentMonthOrdersCount >= thresholdTarget;
  const remainingOrdersNeeded = Math.max(0, thresholdTarget - currentMonthOrdersCount);

  // Sync with loyaltyProgress table
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 2);
  nextMonthDate.setDate(0);

  await prisma.loyaltyProgress.upsert({
    where: {
      customerId_monthYear: {
        customerId,
        monthYear: currentMonth,
      },
    },
    update: {
      qualifyingCompletedOrdersCount: currentMonthOrdersCount,
      thresholdMet,
      discountPercentageEarned: thresholdMet ? 25 : 0,
      expiresAt: nextMonthDate,
    },
    create: {
      customerId,
      monthYear: currentMonth,
      qualifyingCompletedOrdersCount: currentMonthOrdersCount,
      thresholdMet,
      discountPercentageEarned: thresholdMet ? 25 : 0,
      expiresAt: nextMonthDate,
    },
  });

  // 3. Check if customer earned discount in PREVIOUS month to enjoy THIS month
  const prevRecord = await prisma.loyaltyProgress.findUnique({
    where: {
      customerId_monthYear: {
        customerId,
        monthYear: previousMonth,
      },
    },
  });

  const prevMonthStart = new Date(`${previousMonth}-01T00:00:00.000+06:00`);
  const prevMonthOrdersCount = await prisma.parentOrder.count({
    where: {
      customerId,
      status: { not: "CANCELLED" },
      createdAt: {
        gte: prevMonthStart,
        lt: startOfMonth,
      },
    },
  });

  const isEligibleForDiscountThisMonth =
    (prevRecord?.thresholdMet ?? false) || prevMonthOrdersCount >= thresholdTarget;
  const discountPercentageEarned = isEligibleForDiscountThisMonth ? 25 : 0;

  return {
    currentMonthOrdersCount,
    thresholdTarget,
    remainingOrdersNeeded,
    thresholdMet,
    discountPercentageEarned,
    isEligibleForDiscountThisMonth,
    benefitStartDate: `${currentMonth}-01`,
    benefitExpiryDate: `${currentMonth}-31`,
    totalHistoricalOrders: totalOrdersCount,
    isFirstOrderEligible,
  };
}

/**
 * Idempotently records order completion / placement toward the monthly loyalty threshold
 */
export async function recordCompletedOrderForLoyalty(
  customerId: string
): Promise<void> {
  const currentMonth = getDhakaMonthYear();
  const startOfMonth = new Date(`${currentMonth}-01T00:00:00.000+06:00`);

  const actualOrdersCount = await prisma.parentOrder.count({
    where: {
      customerId,
      status: { not: "CANCELLED" },
      createdAt: { gte: startOfMonth },
    },
  });

  const thresholdMet = actualOrdersCount >= 15;
  const discountPercentageEarned = thresholdMet ? 25 : 0;

  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 2);
  nextMonthDate.setDate(0); // last day of next month

  await prisma.loyaltyProgress.upsert({
    where: {
      customerId_monthYear: {
        customerId,
        monthYear: currentMonth,
      },
    },
    update: {
      qualifyingCompletedOrdersCount: actualOrdersCount,
      thresholdMet,
      discountPercentageEarned,
      expiresAt: nextMonthDate,
    },
    create: {
      customerId,
      monthYear: currentMonth,
      qualifyingCompletedOrdersCount: actualOrdersCount,
      thresholdMet,
      discountPercentageEarned,
      expiresAt: nextMonthDate,
    },
  });
}

/**
 * Smart Pricing Engine for খালি খাই (Khali Khai)
 * Handles Separate vs. Combined Delivery Fee Calculation,
 * First-Order Discounts, and Loyalty 15-Orders-in-a-Month Discounts.
 */

export interface PricingInput {
  foodSubtotal: number;
  restaurantCount: number;
  restaurantCoordinates: Array<{ lat: number; lng: number }>;
  customerCoordinates: { lat: number; lng: number };
  isFirstOrder?: boolean;
  hasLoyaltyDiscount?: boolean; // 25% delivery discount from completing >15 orders previous month
  baseDeliveryFee?: number; // default 50 BDT
  additionalStopFee?: number; // default 25 BDT per additional pickup
  perKmRate?: number; // default 12 BDT per km
  firstOrderDiscountCap?: number; // default 50 BDT
}

export interface PricingResult {
  foodSubtotal: number;
  separateDeliveryFee: number;
  combinedDeliveryFee: number;
  deliverySavings: number;
  firstOrderDiscount: number;
  loyaltyDiscount: number;
  totalDeliveryFee: number;
  grandTotal: number;
  riderPayout: number;
  totalDistanceKm: number;
  breakdown: {
    baseFee: number;
    extraStopsFee: number;
    distanceFee: number;
    individualRestaurantFees: number[];
  };
  calculatedAt: string;
}

/**
 * Calculates Haversine distance between two coordinates in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDistance = R * c;
  // Dhaka road factor: real city driving distance is typically ~1.25x - 1.3x straight line
  return Math.round(directDistance * 1.25 * 10) / 10;
}

/**
 * Main pricing calculator function
 */
export function calculatePricing(input: PricingInput): PricingResult {
  const {
    foodSubtotal,
    restaurantCount,
    restaurantCoordinates,
    customerCoordinates,
    isFirstOrder = false,
    hasLoyaltyDiscount = false,
    baseDeliveryFee = 50,
    additionalStopFee = 25,
    perKmRate = 12,
    firstOrderDiscountCap = 50,
  } = input;

  // 1. Separate Orders Delivery Calculation
  // If the customer ordered from each restaurant individually via traditional delivery:
  // Each restaurant would charge base fee + per-km distance fee from that restaurant to customer
  const individualRestaurantFees: number[] = [];
  let separateDeliveryFee = 0;

  for (const rCoord of restaurantCoordinates) {
    const dist = calculateDistanceKm(
      rCoord.lat,
      rCoord.lng,
      customerCoordinates.lat,
      customerCoordinates.lng
    );
    // Baseline single delivery fee formula: base (৳50) + ৳12/km
    const singleFee = Math.round(baseDeliveryFee + Math.max(0, dist - 1.5) * perKmRate);
    individualRestaurantFees.push(singleFee);
    separateDeliveryFee += singleFee;
  }

  // Fallback if no coordinates given
  if (restaurantCount > 0 && separateDeliveryFee === 0) {
    separateDeliveryFee = restaurantCount * 60;
  }

  // 2. Combined Shared Delivery Calculation
  // A single rider picks up from all clustered restaurants and delivers to customer
  // Total route: pickup 1 -> pickup 2 -> ... -> customer
  let totalDistanceKm = 0;
  if (restaurantCoordinates.length > 0) {
    for (let i = 0; i < restaurantCoordinates.length - 1; i++) {
      totalDistanceKm += calculateDistanceKm(
        restaurantCoordinates[i].lat,
        restaurantCoordinates[i].lng,
        restaurantCoordinates[i + 1].lat,
        restaurantCoordinates[i + 1].lng
      );
    }
    // Last restaurant to customer
    const lastRest = restaurantCoordinates[restaurantCoordinates.length - 1];
    totalDistanceKm += calculateDistanceKm(
      lastRest.lat,
      lastRest.lng,
      customerCoordinates.lat,
      customerCoordinates.lng
    );
  } else {
    totalDistanceKm = 2.5;
  }
  totalDistanceKm = Math.round(totalDistanceKm * 10) / 10;

  // Shared fee components:
  // - Base trip fee: baseDeliveryFee (e.g. ৳50)
  // - Additional pickup compensation: (N - 1) * additionalStopFee (e.g. ৳25 each)
  // - Extra route distance fee
  const extraStopsCount = Math.max(0, restaurantCount - 1);
  const extraStopsFee = extraStopsCount * additionalStopFee;
  const distanceFee = Math.round(Math.max(0, totalDistanceKm - 2.0) * perKmRate);

  let rawCombinedDeliveryFee = baseDeliveryFee + extraStopsFee + distanceFee;

  // Ensure combined delivery never exceeds separate delivery!
  if (rawCombinedDeliveryFee > separateDeliveryFee && restaurantCount > 1) {
    rawCombinedDeliveryFee = Math.round(separateDeliveryFee * 0.7); // guaranteed shared economy discount
  }

  // 3. Promotional Discounts
  let firstOrderDiscount = 0;
  let loyaltyDiscount = 0;

  if (isFirstOrder) {
    // First-order promotional benefit: up to ৳50 off delivery
    firstOrderDiscount = Math.min(rawCombinedDeliveryFee, firstOrderDiscountCap);
  } else if (hasLoyaltyDiscount) {
    // Loyalty benefit: 25% discount on delivery fee
    loyaltyDiscount = Math.round(rawCombinedDeliveryFee * 0.25);
  }

  const finalDeliveryFee = Math.max(
    0,
    rawCombinedDeliveryFee - firstOrderDiscount - loyaltyDiscount
  );

  // Delivery savings is the difference between separate total and what customer pays now
  const deliverySavings = Math.max(0, separateDeliveryFee - finalDeliveryFee);

  // Rider Payout: Rider receives fair compensation = Base ৳45 + ৳20 per extra stop + ৳10/km
  const riderPayout = Math.round(45 + extraStopsCount * 22 + totalDistanceKm * 10);

  const grandTotal = foodSubtotal + finalDeliveryFee;

  return {
    foodSubtotal,
    separateDeliveryFee,
    combinedDeliveryFee: rawCombinedDeliveryFee,
    deliverySavings,
    firstOrderDiscount,
    loyaltyDiscount,
    totalDeliveryFee: finalDeliveryFee,
    grandTotal,
    riderPayout,
    totalDistanceKm,
    breakdown: {
      baseFee: baseDeliveryFee,
      extraStopsFee,
      distanceFee,
      individualRestaurantFees,
    },
    calculatedAt: "",
  };
}

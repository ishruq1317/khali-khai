/**
 * Smart Route Feasibility & Logistics Optimizer for খালি খাই (Khali Khai)
 * Synchronizes kitchen preparation times, minimizes rider idle waiting,
 * and determines whether shared delivery is feasible or if a split trip is required.
 */

import { calculateDistanceKm } from "./pricing";

export interface RestaurantStopInput {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  prepTimeMinutes: number; // e.g. 10m, 20m, 30m
  minOrderAmount?: number;
}

export interface RouteOptimizationInput {
  restaurants: RestaurantStopInput[];
  customerCoordinates: { lat: number; lng: number };
  riderCoordinates?: { lat: number; lng: number };
  maxClusterRadiusMeters?: number; // default 600m
  maxFoodHoldingMinutes?: number; // default 25m
  maxAcceptablePrepGapMinutes?: number; // default 20m
}

export interface PlannedStop {
  stopSequence: number;
  type: "PICKUP" | "DROPOFF";
  restaurantId?: string;
  name: string;
  coordinates: { lat: number; lng: number };
  estimatedArrivalMinutesFromNow: number;
  foodReadyMinutesFromNow?: number;
  riderWaitMinutes: number;
}

export interface RouteOptimizationResult {
  routeType: "SHARED" | "SPLIT";
  isFeasibleForSharedDelivery: boolean;
  selectedSequence: PlannedStop[];
  totalTravelMinutes: number;
  totalWaitingMinutes: number;
  estimatedCustomerArrivalMinutes: number;
  maxFoodHoldingDurationMinutes: number;
  freshnessRisk: "LOW" | "MODERATE" | "HIGH";
  reason: string;
  dispatchDelayMinutes: number; // Staggered rider dispatch
}

export function optimizeRoute(input: RouteOptimizationInput): RouteOptimizationResult {
  const {
    restaurants,
    customerCoordinates,
    riderCoordinates = { lat: 23.7460, lng: 90.3750 },
    maxClusterRadiusMeters = 600,
    maxFoodHoldingMinutes = 25,
    maxAcceptablePrepGapMinutes = 20,
  } = input;

  if (restaurants.length === 0) {
    return {
      routeType: "SHARED",
      isFeasibleForSharedDelivery: true,
      selectedSequence: [],
      totalTravelMinutes: 0,
      totalWaitingMinutes: 0,
      estimatedCustomerArrivalMinutes: 0,
      maxFoodHoldingDurationMinutes: 0,
      freshnessRisk: "LOW",
      reason: "No restaurants in route",
      dispatchDelayMinutes: 0,
    };
  }

  // 1. Check Geographic Cluster Feasibility
  // If restaurants are too far from each other (e.g. > 600m cluster threshold), shared pickup causes unacceptable detours
  for (let i = 0; i < restaurants.length; i++) {
    for (let j = i + 1; j < restaurants.length; j++) {
      const distMeters =
        calculateDistanceKm(
          restaurants[i].latitude,
          restaurants[i].longitude,
          restaurants[j].latitude,
          restaurants[j].longitude
        ) * 1000;

      if (distMeters > maxClusterRadiusMeters) {
        return {
          routeType: "SPLIT",
          isFeasibleForSharedDelivery: false,
          selectedSequence: [],
          totalTravelMinutes: 45,
          totalWaitingMinutes: 10,
          estimatedCustomerArrivalMinutes: 50,
          maxFoodHoldingDurationMinutes: 35,
          freshnessRisk: "HIGH",
          reason: `দূরত্বের কারণে স্প্লিট ডেলিভারি প্রস্তাবিত: ${restaurants[i].name} এবং ${restaurants[j].name} এর দূরত্ব ${(distMeters / 1000).toFixed(1)} কিমি, যা নির্ধারিত ${maxClusterRadiusMeters} মিটারের বেশি। (Restaurants are too far apart for efficient single-rider shared pickup).`,
          dispatchDelayMinutes: 0,
        };
      }
    }
  }

  // 2. Kitchen Preparation Time Synchronization
  // Example scenario:
  // Rest A prep: 10 mins
  // Rest B prep: 30 mins
  // Rest C prep: 20 mins
  // If rider picks up from A at minute 10, food from A sits in the bag until minute 30+ waiting for B!
  // Solution: Sequence pickup by ready time or delay rider departure so rider arrives at A just in time.
  const prepTimes = restaurants.map((r) => r.prepTimeMinutes);
  const minPrepTime = Math.min(...prepTimes);
  const maxPrepTime = Math.max(...prepTimes);
  const prepGap = maxPrepTime - minPrepTime;

  if (prepGap > maxAcceptablePrepGapMinutes) {
    // Gap is too wide (e.g. one takes 10m and another takes 35m).
    // Food from the fast restaurant would get cold while waiting for the slow one.
    return {
      routeType: "SPLIT",
      isFeasibleForSharedDelivery: false,
      selectedSequence: [],
      totalTravelMinutes: 40,
      totalWaitingMinutes: 5,
      estimatedCustomerArrivalMinutes: maxPrepTime + 15,
      maxFoodHoldingDurationMinutes: prepGap,
      freshnessRisk: "HIGH",
      reason: `রান্নার সময়ের ব্যবধান (${prepGap} মিনিট) বেশি হওয়ায় খাবারের স্বাদ অটুট রাখতে দুটি আলাদা ডেলিভারি (Split Delivery) সুপারিশ করা হচ্ছে। (Prep gap exceeds acceptable holding threshold).`,
      dispatchDelayMinutes: 0,
    };
  }

  // Sort pickups: Best sequence is ordered by preparation completion time
  // This allows the rider to visit the restaurant whose food is ready first, then next, etc.
  // With staggered dispatch so the rider doesn't wait idle.
  const sortedRestaurants = [...restaurants].sort(
    (a, b) => a.prepTimeMinutes - b.prepTimeMinutes
  );

  // Staggered Dispatch: Rider should depart only when the first pickup is nearly ready!
  // Travel from rider to first restaurant takes ~5 mins in Dhaka
  const transitToFirstRestMinutes = 5;
  const dispatchDelayMinutes = Math.max(
    0,
    sortedRestaurants[0].prepTimeMinutes - transitToFirstRestMinutes
  );

  const plannedStops: PlannedStop[] = [];
  let currentMinutes = dispatchDelayMinutes + transitToFirstRestMinutes;
  let totalWaitMinutes = 0;
  let maxHoldingMinutes = 0;
  const pickupTimes: number[] = [];

  for (let i = 0; i < sortedRestaurants.length; i++) {
    const rest = sortedRestaurants[i];
    if (i > 0) {
      // Intra-restaurant transit (~3 mins in 400m cluster)
      currentMinutes += 3;
    }

    // If rider arrives before food is ready, rider waits
    let waitAtThisStop = 0;
    if (currentMinutes < rest.prepTimeMinutes) {
      waitAtThisStop = rest.prepTimeMinutes - currentMinutes;
      currentMinutes = rest.prepTimeMinutes;
    }
    totalWaitMinutes += waitAtThisStop;
    pickupTimes.push(currentMinutes);

    plannedStops.push({
      stopSequence: i + 1,
      type: "PICKUP",
      restaurantId: rest.id,
      name: rest.name,
      coordinates: { lat: rest.latitude, lng: rest.longitude },
      estimatedArrivalMinutesFromNow: currentMinutes,
      foodReadyMinutesFromNow: rest.prepTimeMinutes,
      riderWaitMinutes: waitAtThisStop,
    });
  }

  // Final Dropoff Stop: Travel to customer (~12-15 mins)
  const lastPickup = plannedStops[plannedStops.length - 1];
  const distanceToCustomer = calculateDistanceKm(
    lastPickup.coordinates.lat,
    lastPickup.coordinates.lng,
    customerCoordinates.lat,
    customerCoordinates.lng
  );
  const transitToCustomerMinutes = Math.round(distanceToCustomer * 3.5 + 5);
  const finalArrivalMinutes = currentMinutes + transitToCustomerMinutes;

  // Max food holding duration is time from first pickup to final customer dropoff
  maxHoldingMinutes = finalArrivalMinutes - pickupTimes[0];

  plannedStops.push({
    stopSequence: plannedStops.length + 1,
    type: "DROPOFF",
    name: "গ্রাহকের ঠিকানা (Customer Address)",
    coordinates: customerCoordinates,
    estimatedArrivalMinutesFromNow: finalArrivalMinutes,
    riderWaitMinutes: 0,
  });

  const freshnessRisk: "LOW" | "MODERATE" | "HIGH" =
    maxHoldingMinutes <= 20 ? "LOW" : maxHoldingMinutes <= maxFoodHoldingMinutes ? "MODERATE" : "HIGH";

  return {
    routeType: "SHARED",
    isFeasibleForSharedDelivery: true,
    selectedSequence: plannedStops,
    totalTravelMinutes: transitToFirstRestMinutes + (sortedRestaurants.length - 1) * 3 + transitToCustomerMinutes,
    totalWaitingMinutes: totalWaitMinutes,
    estimatedCustomerArrivalMinutes: finalArrivalMinutes,
    maxFoodHoldingDurationMinutes: maxHoldingMinutes,
    freshnessRisk,
    reason: `স্মার্ট শেয়ার্ড রুট নিশ্চিত: রেস্টুরেন্টগুলো কাছাকাছি এবং রান্নার সময় সামঞ্জস্যপূর্ণ। রাইডার ${dispatchDelayMinutes > 0 ? `${dispatchDelayMinutes} মিনিট পর` : "অবিলম্বে"} রওনা দেবেন যাতে খাবার গরম ও সতেজ থাকে। (Synchronized shared route verified).`,
    dispatchDelayMinutes,
  };
}

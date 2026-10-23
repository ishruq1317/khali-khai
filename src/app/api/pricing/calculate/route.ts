import { NextResponse } from "next/server";
import { calculatePricing } from "@/lib/pricing";
import { optimizeRoute } from "@/lib/logistics";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cartItems,
      customerLat = 23.7430,
      customerLng = 90.3800,
      isFirstOrder = false,
      hasLoyaltyDiscount = false,
    } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({
        pricing: calculatePricing({
          foodSubtotal: 0,
          restaurantCount: 0,
          restaurantCoordinates: [],
          customerCoordinates: { lat: customerLat, lng: customerLng },
        }),
        routeResult: null,
      });
    }

    // Extract unique restaurants
    const restaurantMap = new Map<string, {
      id: string;
      name: string;
      lat: number;
      lng: number;
      prepTimeMinutes: number;
      subtotal: number;
    }>();

    for (const item of cartItems) {
      if (!restaurantMap.has(item.restaurantId)) {
        restaurantMap.set(item.restaurantId, {
          id: item.restaurantId,
          name: item.restaurantNameBn || item.restaurantNameEn || "রেস্টুরেন্ট",
          lat: item.restaurantLat,
          lng: item.restaurantLng,
          prepTimeMinutes: item.prepTimeMinutes || 15,
          subtotal: 0,
        });
      }
      const r = restaurantMap.get(item.restaurantId)!;
      r.subtotal += item.price * item.quantity;
    }

    const uniqueRestaurants = Array.from(restaurantMap.values());
    const foodSubtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const restaurantCoords = uniqueRestaurants.map((r) => ({
      lat: r.lat,
      lng: r.lng,
    }));

    // Calculate Pricing
    const pricing = calculatePricing({
      foodSubtotal,
      restaurantCount: uniqueRestaurants.length,
      restaurantCoordinates: restaurantCoords,
      customerCoordinates: { lat: customerLat, lng: customerLng },
      isFirstOrder,
      hasLoyaltyDiscount,
    });

    // Calculate Logistics & Route Optimization
    const routeResult = optimizeRoute({
      restaurants: uniqueRestaurants.map((r) => ({
        id: r.id,
        name: r.name,
        latitude: r.lat,
        longitude: r.lng,
        prepTimeMinutes: r.prepTimeMinutes,
      })),
      customerCoordinates: { lat: customerLat, lng: customerLng },
    });

    return NextResponse.json({
      pricing,
      routeResult,
      restaurantCount: uniqueRestaurants.length,
      uniqueRestaurants,
    });
  } catch (error) {
    console.error("Pricing API error:", error);
    return NextResponse.json(
      { error: "মূল্য নির্ধারণে ত্রুটি হয়েছে" },
      { status: 500 }
    );
  }
}

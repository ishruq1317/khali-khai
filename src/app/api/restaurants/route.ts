import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDistanceKm } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const area = searchParams.get("area");
    const query = searchParams.get("q");
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusParam = searchParams.get("radius"); // e.g. "6", "8", "all"

    // Default to Savar Radio Colony if not provided, or parse user's device coordinates
    const userLat = latParam ? parseFloat(latParam) : 23.8480;
    const userLng = lngParam ? parseFloat(lngParam) : 90.2600;

    // Default strict radius 8.0 km as requested by user
    const maxRadiusKm = radiusParam === "all" ? 9999 : radiusParam ? parseFloat(radiusParam) : 8.0;

    const whereClause: any = {};

    if (city && city !== "all") {
      whereClause.city = { equals: city };
    }

    if (area && area !== "all") {
      whereClause.area = { equals: area };
    }

    if (query) {
      whereClause.OR = [
        { nameBn: { contains: query } },
        { nameEn: { contains: query } },
        { descriptionBn: { contains: query } },
        { descriptionEn: { contains: query } },
        { city: { contains: query } },
        { area: { contains: query } },
      ];
    }

    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      include: {
        operatingHours: true,
        categories: {
          include: {
            items: {
              where: { isAvailable: true },
            },
          },
        },
      },
    });

    const now = new Date();
    const currentDay = now.getDay();
    const currentHourMinute = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const formattedRestaurants = restaurants.map((r) => {
      const todaySchedule = r.operatingHours.find((h) => h.dayOfWeek === currentDay);
      let isWithinHours = true;
      if (todaySchedule && !todaySchedule.isClosed) {
        isWithinHours =
          currentHourMinute >= todaySchedule.openTime &&
          currentHourMinute <= todaySchedule.closeTime;
      } else if (todaySchedule?.isClosed) {
        isWithinHours = false;
      }

      const distanceKm = calculateDistanceKm(
        r.latitude,
        r.longitude,
        userLat,
        userLng
      );

      return {
        id: r.id,
        nameBn: r.nameBn,
        nameEn: r.nameEn,
        slug: r.slug,
        descriptionBn: r.descriptionBn,
        descriptionEn: r.descriptionEn,
        phone: r.phone,
        address: r.address,
        area: r.area,
        city: r.city,
        latitude: r.latitude,
        longitude: r.longitude,
        image: r.image,
        isOpen: r.isOpen && isWithinHours,
        acceptsOrders: r.acceptsOrders,
        rating: r.rating,
        reviewCount: r.reviewCount,
        minOrderAmount: r.minOrderAmount,
        avgPrepTimeMinutes: r.avgPrepTimeMinutes,
        distanceKm,
        isServiceable: distanceKm <= maxRadiusKm,
        categories: r.categories,
      };
    });

    // Filter strictly within requested delivery radius (6-8 km)
    const withinRadiusRestaurants = formattedRestaurants.filter(
      (r) => r.distanceKm <= maxRadiusKm
    );

    // Sort by proximity (closest first)
    withinRadiusRestaurants.sort((a, b) => a.distanceKm - b.distanceKm);

    // Detect user's current area name based on coordinates
    let detectedLocationName = "আপনার বর্তমান লোকেশন";
    if (userLat >= 23.82 && userLat <= 23.88 && userLng >= 23.23 && userLng <= 90.30) {
      detectedLocationName = "রেডিও কলোনি, সাভার, ঢাকা (Radio Colony, Savar)";
    } else if (userLat >= 23.72 && userLat <= 23.77 && userLng >= 90.35 && userLng <= 90.40) {
      detectedLocationName = "ধানমণ্ডি, ঢাকা (Dhanmondi, Dhaka)";
    } else if (userLat >= 23.77 && userLat <= 23.83 && userLng >= 90.39 && userLng <= 90.45) {
      detectedLocationName = "গুলশান / বনানী, ঢাকা (Gulshan / Banani)";
    } else if (userLat >= 22.30 && userLat <= 22.42 && userLng >= 91.75 && userLng <= 91.88) {
      detectedLocationName = "জিইসি, চট্টগ্রাম (GEC, Chittagong)";
    } else if (userLat >= 24.85 && userLat <= 24.95 && userLng >= 91.80 && userLng <= 91.92) {
      detectedLocationName = "জিন্দাবাজার, সিলেট (Zindabazar, Sylhet)";
    } else if (userLat >= 21.38 && userLat <= 21.48 && userLng >= 91.93 && userLng <= 92.02) {
      detectedLocationName = "কলাতলী বিচ, কক্সবাজার (Kolatoli, Cox's Bazar)";
    } else if (userLat >= 24.32 && userLat <= 24.40 && userLng >= 88.55 && userLng <= 88.66) {
      detectedLocationName = "সাহেব বাজার, রাজশাহী (Shaheb Bazar, Rajshahi)";
    }

    return NextResponse.json({
      restaurants: withinRadiusRestaurants,
      count: withinRadiusRestaurants.length,
      totalFoundAcrossRadius: withinRadiusRestaurants.length,
      appliedRadiusKm: maxRadiusKm,
      userCoordinates: { lat: userLat, lng: userLng },
      detectedLocationName,
    });
  } catch (error) {
    console.error("Restaurants API error:", error);
    return NextResponse.json(
      { error: "রেস্টুরেন্ট লোড করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

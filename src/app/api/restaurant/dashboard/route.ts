import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth(["RESTAURANT_MANAGER", "ADMIN"]);

    let restaurant = null;
    if (session.role === "RESTAURANT_MANAGER") {
      restaurant = await prisma.restaurant.findUnique({
        where: { managerUserId: session.userId },
        include: {
          categories: {
            include: { items: true },
          },
          subOrders: {
            include: {
              items: true,
              parentOrder: {
                include: {
                  deliveryAddress: true,
                  customer: {
                    include: { user: { select: { name: true, phone: true } } },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } else {
      // If admin visits restaurant dashboard, pick the first restaurant for demo
      restaurant = await prisma.restaurant.findFirst({
        include: {
          categories: { include: { items: true } },
          subOrders: {
            include: {
              items: true,
              parentOrder: {
                include: {
                  deliveryAddress: true,
                  customer: {
                    include: { user: { select: { name: true, phone: true } } },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    if (!restaurant) {
      return NextResponse.json({ error: "কোনো রেস্টুরেন্ট সংযুক্ত পাওয়া যায়নি" }, { status: 404 });
    }

    // Calculate metrics
    const totalOrders = restaurant.subOrders.length;
    const pendingOrders = restaurant.subOrders.filter(
      (s) => s.status === "PENDING_ACCEPTANCE" || s.status === "ACCEPTED" || s.status === "PREPARING"
    ).length;
    const completedOrders = restaurant.subOrders.filter((s) => s.status === "DELIVERED").length;
    const totalEarnings = restaurant.subOrders
      .filter((s) => s.status === "DELIVERED")
      .reduce((sum, s) => sum + s.subtotal, 0);

    return NextResponse.json({
      restaurant,
      metrics: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalEarnings,
      },
    });
  } catch (error: any) {
    console.error("Restaurant dashboard API error:", error);
    return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 403 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAuth(["RESTAURANT_MANAGER", "ADMIN"]);
    const body = await request.json();
    const { isOpen, avgPrepTimeMinutes } = body;

    let restaurantId = session.restaurantId;
    if (!restaurantId && session.role === "ADMIN") {
      const first = await prisma.restaurant.findFirst();
      restaurantId = first?.id;
    }

    if (!restaurantId) {
      return NextResponse.json({ error: "রেস্টুরেন্ট আইডি পাওয়া যায়নি" }, { status: 400 });
    }

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(isOpen !== undefined ? { isOpen: Boolean(isOpen) } : {}),
        ...(avgPrepTimeMinutes !== undefined ? { avgPrepTimeMinutes: Number(avgPrepTimeMinutes) } : {}),
      },
    });

    return NextResponse.json({ success: true, restaurant: updated });
  } catch (error) {
    console.error("Restaurant update error:", error);
    return NextResponse.json({ error: "আপডেট করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}

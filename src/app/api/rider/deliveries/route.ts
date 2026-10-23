import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { recordCompletedOrderForLoyalty } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth(["RIDER", "ADMIN"]);

    let riderProfile = null;
    if (session.role === "RIDER") {
      riderProfile = await prisma.riderProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!riderProfile) {
        return NextResponse.json({ deliveries: [], riderProfile: null });
      }
    }

    const whereClause: any = {};
    if (riderProfile) {
      whereClause.assignments = {
        some: { riderId: riderProfile.id },
      };
    }

    const deliveryPlans = await prisma.deliveryPlan.findMany({
      where: whereClause,
      include: {
        parentOrder: {
          include: {
            deliveryAddress: true,
            customer: {
              include: { user: { select: { name: true, phone: true } } },
            },
            subOrders: {
              include: { restaurant: true, items: true },
            },
          },
        },
        stops: {
          orderBy: { stopSequence: "asc" },
          include: { restaurant: true },
        },
        assignments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      deliveryPlans,
      riderProfile,
    });
  } catch (error: any) {
    console.error("Rider deliveries fetch error:", error);
    return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 403 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAuth(["RIDER", "ADMIN"]);
    const body = await request.json();
    const { action, deliveryPlanId, stopId, isOnline } = body;

    // Toggle Online
    if (action === "TOGGLE_ONLINE" && session.role === "RIDER") {
      const updated = await prisma.riderProfile.update({
        where: { userId: session.userId },
        data: { isOnline: Boolean(isOnline) },
      });
      return NextResponse.json({ success: true, riderProfile: updated });
    }

    // Complete a Stop
    if (action === "COMPLETE_STOP" && stopId) {
      const stop = await prisma.deliveryStop.update({
        where: { id: stopId },
        data: {
          isCompleted: true,
          actualArrival: new Date(),
        },
        include: { deliveryPlan: true },
      });

      // If this stop was a PICKUP, mark the restaurant sub-order as PICKED_UP
      if (stop.stopType === "PICKUP" && stop.restaurantId) {
        await prisma.restaurantSubOrder.updateMany({
          where: {
            parentOrderId: stop.deliveryPlan.parentOrderId,
            restaurantId: stop.restaurantId,
          },
          data: { status: "PICKED_UP" },
        });

        await prisma.parentOrder.update({
          where: { id: stop.deliveryPlan.parentOrderId },
          data: { status: "OUT_FOR_DELIVERY" },
        });
      }

      // If this stop was the DROPOFF, mark the whole parent order and plan as DELIVERED!
      if (stop.stopType === "DROPOFF") {
        await prisma.deliveryPlan.update({
          where: { id: stop.deliveryPlanId },
          data: { status: "COMPLETED" },
        });

        const completedOrder = await prisma.parentOrder.update({
          where: { id: stop.deliveryPlan.parentOrderId },
          data: { status: "DELIVERED" },
        });

        await prisma.restaurantSubOrder.updateMany({
          where: { parentOrderId: completedOrder.id },
          data: { status: "DELIVERED" },
        });

        // Trigger loyalty engine update for customer!
        await recordCompletedOrderForLoyalty(completedOrder.customerId);
      }

      return NextResponse.json({ success: true, stop });
    }

    return NextResponse.json({ error: "অজানা অ্যাকশন" }, { status: 400 });
  } catch (error: any) {
    console.error("Rider update error:", error);
    return NextResponse.json({ error: "আপডেট করতে ব্যর্থ" }, { status: 500 });
  }
}

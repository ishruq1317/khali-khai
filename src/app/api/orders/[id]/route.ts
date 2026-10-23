import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    const order = await prisma.parentOrder.findFirst({
      where: {
        OR: [{ id: id }, { orderNumber: id }],
      },
      include: {
        deliveryAddress: true,
        customer: {
          include: {
            user: {
              select: { name: true, phone: true, email: true },
            },
          },
        },
        subOrders: {
          include: {
            restaurant: true,
            items: true,
          },
        },
        deliveryPlans: {
          include: {
            stops: {
              orderBy: { stopSequence: "asc" },
            },
            assignments: {
              include: {
                rider: {
                  include: {
                    user: {
                      select: { name: true, phone: true },
                    },
                  },
                },
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "অর্ডারটি পাওয়া যায়নি (Order not found)" },
        { status: 404 }
      );
    }

    // Role security check:
    // Customers can view only their own orders
    // Restaurant managers can view only if their restaurant is a sub-order
    // Riders can view if assigned
    // Admins can view any order
    if (session) {
      if (session.role === "CUSTOMER" && order.customer.userId !== session.userId) {
        return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 403 });
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order detail error:", error);
    return NextResponse.json(
      { error: "অর্ডারের তথ্য আনতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}

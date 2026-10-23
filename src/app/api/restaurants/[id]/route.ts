import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        operatingHours: true,
        categories: {
          orderBy: { sortOrder: "asc" },
          include: {
            items: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "রেস্টুরেন্ট পাওয়া যায়নি (Restaurant not found)" },
        { status: 404 }
      );
    }

    return NextResponse.json({ restaurant });
  } catch (error) {
    console.error("Restaurant detail error:", error);
    return NextResponse.json(
      { error: "তথ্য লোড করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}

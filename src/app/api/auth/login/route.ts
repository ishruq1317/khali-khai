import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "ইমেইল এবং পাসওয়ার্ড প্রয়োজন (Email and password required)" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        managedRestaurant: true,
        riderProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ভুল ইমেইল বা পাসওয়ার্ড (Invalid email or password)" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "ভুল ইমেইল বা পাসওয়ার্ড (Invalid email or password)" },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.managedRestaurant?.id,
      riderId: user.riderProfile?.id,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.managedRestaurant?.id,
        riderId: user.riderProfile?.id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে (Internal server error)" },
      { status: 500 }
    );
  }
}

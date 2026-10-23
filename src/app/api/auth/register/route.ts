import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "সবগুলো প্রয়োজনীয় তথ্য দিন (Name, email, and password required)" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে (Email already registered)" },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        phone: phone || null,
        passwordHash,
        role: "CUSTOMER",
        customerProfile: {
          create: {},
        },
      },
      include: {
        customerProfile: true,
      },
    });

    await createSession({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "নিবন্ধনে সমস্যা হয়েছে (Registration failed)" },
      { status: 500 }
    );
  }
}

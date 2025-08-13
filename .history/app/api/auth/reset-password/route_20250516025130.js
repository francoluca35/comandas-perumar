// 2. /app/api/auth/reset-password/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/utils/encrypt";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function PUT(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token o nueva contraseña faltante" },
        { status: 400 }
      );
    }

    const decoded = verify(token, JWT_SECRET);

    const client = await clientPromise;
    const db = client.db("comandas");

    const hashed = await hashPassword(newPassword);
    await db
      .collection("users")
      .updateOne({ _id: decoded.userId }, { $set: { password: hashed } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Token inválido o expirado" },
      { status: 400 }
    );
  }
}

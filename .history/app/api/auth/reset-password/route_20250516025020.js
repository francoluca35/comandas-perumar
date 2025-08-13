import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/utils/encrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_demo";

export async function PUT(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const client = await clientPromise;
    const db = client.db("comandas");

    const hashed = await hashPassword(newPassword);

    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(decoded.id) },
        { $set: { password: hashed } }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al resetear contraseña:", error);
    return NextResponse.json(
      { error: "Token inválido o expirado" },
      { status: 401 }
    );
  }
}

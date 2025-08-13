import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { comparePassword, hashPassword } from "@/utils/encrypt";

export async function PUT(req) {
  try {
    const { email, oldPassword, newPassword } = await req.json();

    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("comandas");
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    const match = await comparePassword(oldPassword, user.password);
    if (!match) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta." },
        { status: 401 }
      );
    }

    const hashedNew = await hashPassword(newPassword);

    await db
      .collection("users")
      .updateOne({ email }, { $set: { password: hashedNew } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("💥 Error en change-password:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

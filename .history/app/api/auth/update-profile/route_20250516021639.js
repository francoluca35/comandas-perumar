import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function PUT(req) {
  try {
    const { username, email } = await req.json();

    if (!username || !email) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    // Buscar por email o username actual y actualizar los dos campos
    const result = await db.collection("users").updateOne(
      { email }, // o podés buscar por username si preferís
      {
        $set: {
          username,
          email,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

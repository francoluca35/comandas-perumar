// /api/auth/logout.js
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { username } = body;

    const client = await clientPromise;
    const db = client.db("comandas");

    // Actualizar el turno más reciente del usuario
    await db.collection("turnos").updateOne(
      { username, online: true },
      {
        $set: {
          fin: new Date(),
          online: false,
        },
      },
      { sort: { inicio: -1 } } // El más reciente primero
    );

    return NextResponse.json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("🔥 Error al cerrar sesión:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}

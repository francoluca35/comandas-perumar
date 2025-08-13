import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username } = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");

    await db.collection("turnos").updateOne(
      { username, online: true },
      {
        $set: {
          fin: new Date(),
          online: false,
        },
      },
      { sort: { inicio: -1 } }
    );

    return NextResponse.json({ message: "Sesión forzada cerrada" });
  } catch (error) {
    console.error("🔥 Error al cerrar sesión forzada:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username } = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");

    // Elimina el usuario
    await db.collection("users").deleteOne({ username });

    // Elimina también sus turnos
    await db.collection("turnos").deleteMany({ username });

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("🔥 Error al eliminar usuario:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

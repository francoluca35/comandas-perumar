import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const ultimo = await db
      .collection("turnos")
      .find()
      .sort({ inicio: -1 })
      .limit(1)
      .toArray();

    const fecha = ultimo[0]?.inicio || null;

    return NextResponse.json({ fecha });
  } catch (err) {
    console.error("Error obteniendo exportación:", err);
    return NextResponse.json({ fecha: null }, { status: 200 });
  }
}

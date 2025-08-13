import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// GET: Listar historial de retiros
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const retiros = await db.collection("retiroEfectivo").find({}).toArray();
    return NextResponse.json(retiros);
  } catch (err) {
    console.error("Error al obtener retiros:", err);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

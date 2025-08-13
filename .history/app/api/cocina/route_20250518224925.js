import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const pedidos = await db
      .collection("cocina")
      .find()
      .sort({ hora: -1 }) // más reciente primero
      .toArray();

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Error al obtener cocina:", error);
    return NextResponse.json(
      { error: "Error al obtener pedidos de cocina" },
      { status: 500 }
    );
  }
}

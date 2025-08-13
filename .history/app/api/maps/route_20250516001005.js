// /app/api/maps/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");
    const pedidos = await db
      .collection("pedidos")
      .find({ estado: "en curso" })
      .toArray();

    return NextResponse.json(pedidos);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los pedidos" },
      { status: 500 }
    );
  }
}

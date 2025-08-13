import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { codigo, cliente, productos, metodoPago, total, estado, hora } =
      await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");

    await db.collection("tables").updateOne(
      { codigo },
      {
        $set: {
          cliente,
          productos,
          metodoPago,
          total,
          estado,
          hora,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error actualizando mesa:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");
    const mesas = await db.collection("tables").find({}).toArray();

    return NextResponse.json(mesas);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener las mesas" },
      { status: 500 }
    );
  }
}

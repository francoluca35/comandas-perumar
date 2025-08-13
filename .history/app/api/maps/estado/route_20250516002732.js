// /app/api/maps/estado/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function PUT(req) {
  try {
    const { id, nuevoEstado } = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");

    await db
      .collection("pedidos")
      .updateOne({ _id: new ObjectId(id) }, { $set: { estado: nuevoEstado } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar estado" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Falta el ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const fechaActual = new Date();

    const result = await db.collection("pedidos").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          estado: "entregado",
          horaEntrega: fechaActual.toISOString(), // 👈 se guarda como string ISO
        },
      }
    );

    return NextResponse.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    console.error("Error al marcar como entregado:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

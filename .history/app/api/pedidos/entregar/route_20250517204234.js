import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(req) {
  try {
    const { id } = await req.json();
    const client = await clientPromise;
    const db = client.db("comandas");

    const result = await db
      .collection("pedidos")
      .updateOne({ _id: new ObjectId(id) }, { $set: { estado: "entregado" } });

    if (result.modifiedCount === 1) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "No se encontró el pedido" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error al marcar como entregado:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

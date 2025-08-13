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
    const pedidosCollection = db.collection("pedidos");
    const cajaCollection = db.collection("cajaRegistradora");

    const fechaActual = new Date();

    // Buscamos el pedido completo
    const pedido = await pedidosCollection.findOne({ _id: new ObjectId(id) });

    // Primero actualizamos el pedido a entregado
    await pedidosCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          estado: "entregado",
          horaEntrega: fechaActual.toISOString(),
        },
      }
    );

    // SOLO actualizamos caja si es efectivo
    if (pedido.formaDePago === "efectivo") {
      await cajaCollection.updateOne(
        {},
        { $inc: { montoActual: pedido.total } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al marcar como entregado:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

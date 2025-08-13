import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const pedido = await req.json();
    const client = await clientPromise;
    const db = client.db("comandas");
    const collection = db.collection("pedidos");

    const nuevoPedido = {
      ...pedido,
      estado: pedido.estado || "en curso",
      fecha: pedido.fecha || new Date().toISOString(),
    };

    const resultado = await collection.insertOne(nuevoPedido);

    // Si el pago es en efectivo, sumar a ingresos y caja
    if (pedido.formaDePago === "efectivo") {
      const fechaActual = new Date();
      const fechaLocal = fechaActual.toLocaleDateString("es-AR");

      // 1. Sumar a ingresosDiarios
      await db
        .collection("ingresosDiarios")
        .updateOne(
          { fecha: fechaLocal },
          { $inc: { efectivo: pedido.total } },
          { upsert: true }
        );

      // 2. Sumar a cajaRegistradora (¡esto es lo que suma el dinero en caja!)
      await db.collection("cajaRegistradora").updateOne(
        {},
        {
          $inc: { montoActual: pedido.total },
          $set: { fechaActualizacion: new Date() },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pedido guardado correctamente",
      id: resultado.insertedId,
    });
  } catch (error) {
    console.error("Error al guardar pedido:", error);
    return NextResponse.json(
      { error: "Error al guardar el pedido" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");
    const pedidos = await db.collection("pedidos").find().toArray();

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

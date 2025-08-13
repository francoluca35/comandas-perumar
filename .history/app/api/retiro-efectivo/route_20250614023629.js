import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const { montoRetirado } = await req.json();
    if (!montoRetirado || montoRetirado <= 0)
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });

    const caja = await db.collection("cajaRegistradora").findOne({});
    if (!caja)
      return NextResponse.json(
        { error: "Caja no inicializada" },
        { status: 400 }
      );

    const nuevoMonto = caja.montoActual - montoRetirado;
    if (nuevoMonto < 0)
      return NextResponse.json(
        { error: "Fondos insuficientes" },
        { status: 400 }
      );

    await db.collection("retiroEfectivo").insertOne({
      montoRetirado,
      antiguoMonto: caja.montoActual,
      montoActualizado: nuevoMonto,
      timestamp: new Date(),
    });

    await db
      .collection("cajaRegistradora")
      .updateOne(
        {},
        { $set: { montoActual: nuevoMonto, fechaActualizacion: new Date() } }
      );

    return NextResponse.json({ message: "Retiro registrado" });
  } catch (err) {
    console.error("Error al retirar:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

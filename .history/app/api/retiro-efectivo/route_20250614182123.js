import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { monto, motivo } = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");
    const cajaCollection = db.collection("cajaRegistradora");
    const retirosCollection = db.collection("retiroEfectivo");

    const fechaActual = new Date().toLocaleDateString("es-AR");

    await cajaCollection.updateOne({}, { $inc: { montoActual: -monto } });
    await retirosCollection.insertOne({
      monto,
      motivo,
      fecha: fechaActual,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al retirar:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

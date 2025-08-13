import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req) {
  const body = await req.json();
  const { monto, fecha } = body;
  const db = await getDb();

  // Sumar a ingresosDiarios
  await db
    .collection("ingresosDiarios")
    .updateOne({ fecha }, { $inc: { efectivo: monto } }, { upsert: true });

  // Sumar a cajaRegistradora (debería haber sólo 1 documento)
  await db.collection("cajaRegistradora").updateOne(
    {},
    {
      $inc: { montoActual: monto },
      $set: { fechaActualizacion: new Date() },
    }
  );

  return NextResponse.json({ success: true });
}

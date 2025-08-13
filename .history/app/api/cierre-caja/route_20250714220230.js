// app/api/cierre-caja/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST() {
  const client = await connectToDatabase();
  const db = client.db("comandas");

  const hoy = new Date().toLocaleDateString("es-AR");

  const totalIngresos = await db
    .collection("ingresosDiarios")
    .aggregate([
      { $match: { fecha: hoy } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ])
    .toArray();

  const totalRetiros = await db
    .collection("retiroEfectivo")
    .aggregate([
      { $match: { fecha: hoy } },
      { $group: { _id: null, total: { $sum: "$monto" } } },
    ])
    .toArray();

  const ingresos = totalIngresos[0]?.total || 0;
  const retiros = totalRetiros[0]?.total || 0;
  const neto = ingresos - retiros;

  const hora = new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const montoCaja = await db
    .collection("caja")
    .findOne({}, { sort: { _id: -1 } });

  await db.collection("cierres").updateOne(
    { fecha: hoy },
    {
      $set: {
        fecha: hoy,
        ingresoTotal: ingresos,
        retirosTotal: retiros,
        neto,
        cierreCaja: montoCaja?.montoActual || 0,
        horaCierre: hora,
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}

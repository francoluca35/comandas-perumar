import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const ingresos = await db.collection("ingresosDiarios").find().toArray();
    const retiros = await db.collection("retiroEfectivo").find().toArray();

    const agruparPorFecha = {};

    // Ingresos
    for (const ingreso of ingresos) {
      const fechaRaw = ingreso.fecha;
      const fechaValida = new Date(fechaRaw);
      if (isNaN(fechaValida)) continue;

      const fecha = fechaValida.toISOString().split("T")[0];

      if (!agruparPorFecha[fecha]) {
        agruparPorFecha[fecha] = {
          fecha,
          ingresoTotal: 0,
          retirosTotal: 0,
          retiros: [],
        };
      }

      agruparPorFecha[fecha].ingresoTotal += ingreso.ingresoTotal ?? 0;
    }

    // Retiros
    for (const retiro of retiros) {
      const fechaValida = new Date(retiro.timestamp);
      if (isNaN(fechaValida)) continue;

      const fecha = fechaValida.toISOString().split("T")[0];

      if (!agruparPorFecha[fecha]) {
        agruparPorFecha[fecha] = {
          fecha,
          ingresoTotal: 0,
          retirosTotal: 0,
          retiros: [],
        };
      }

      agruparPorFecha[fecha].retirosTotal += retiro.montoRetirado ?? 0;
      agruparPorFecha[fecha].retiros.push({
        monto: retiro.montoRetirado,
        motivo: retiro.motivo,
        hora: fechaValida.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    const resultado = Object.values(agruparPorFecha).map((item) => ({
      ...item,
      neto: item.ingresoTotal - item.retirosTotal,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error en informe diario:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { totalPedido, timestamp } = await req.json();

    if (!totalPedido || !timestamp) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    await db.collection("ingresosDiarios").insertOne({
      totalPedido: parseFloat(totalPedido),
      timestamp: new Date(timestamp),
    });

    return NextResponse.json({ message: "Ingreso diario registrado" });
  } catch (err) {
    console.error("Error al guardar ingreso diario:", err);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}

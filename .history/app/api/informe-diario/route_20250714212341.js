import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    const db = await connectToDatabase();

    const ingresos = await db.collection("ingresosDiarios").find().toArray();
    const retiros = await db.collection("retiroEfectivo").find().toArray();

    const agruparPorFecha = {};

    // Agrupar ingresos por día (usando "timestamp")
    for (const ingreso of ingresos) {
      const date = new Date(ingreso.timestamp);
      if (isNaN(date.getTime())) continue; // Ignorar si no es una fecha válida
      const fecha = date.toISOString().split("T")[0];

      if (!agruparPorFecha[fecha]) {
        agruparPorFecha[fecha] = {
          ingresoTotal: 0,
          retirosTotal: 0,
          retiros: [],
        };
      }
      agruparPorFecha[fecha].ingresoTotal += ingreso.totalPedido || 0;
    }

    // Agrupar retiros por día (usando "timestamp")
    for (const retiro of retiros) {
      try {
        const retiroDate = new Date(retiro.timestamp);
        if (isNaN(retiroDate.getTime())) continue;

        const fecha = retiroDate.toISOString().split("T")[0];

        if (!agruparPorFecha[fecha]) {
          agruparPorFecha[fecha] = {
            ingresoTotal: 0,
            retirosTotal: 0,
            retiros: [],
          };
        }

        agruparPorFecha[fecha].retirosTotal += retiro.montoRetirado || 0;

        const hora = retiroDate.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        agruparPorFecha[fecha].retiros.push({
          hora,
          monto: retiro.montoRetirado || 0,
          motivo: retiro.motivo || "",
        });
      } catch (error) {
        console.warn("Retiro con fecha inválida:", retiro);
        continue;
      }
    }

    const resultado = Object.entries(agruparPorFecha).map(([fecha, datos]) => ({
      fecha,
      ingresoTotal: datos.ingresoTotal,
      retirosTotal: datos.retirosTotal,
      neto: datos.ingresoTotal - datos.retirosTotal,
      retiros: datos.retiros,
    }));

    return NextResponse.json(
      resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    );
  } catch (err) {
    console.error("Error al generar informe diario:", err);
    return NextResponse.json(
      { error: "Error al generar informe diario" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { totalPedido, timestamp } = await req.json();

    if (!totalPedido || !timestamp) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const db = await connectToDatabase();

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

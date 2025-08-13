import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const ingresos = await db.collection("ingresosDiarios").find().toArray();
    const retiros = await db.collection("retiroEfectivo").find().toArray();

    const agruparPorFecha = {};

    // Agrupamos ingresos
    for (const ingreso of ingresos) {
      const fecha = new Date(ingreso.fecha).toISOString().split("T")[0];

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

    // Agrupamos retiros
    for (const retiro of retiros) {
      const fecha = new Date(retiro.timestamp).toISOString().split("T")[0];

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
        hora: new Date(retiro.timestamp).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    // Convertimos el objeto agrupado en un array y calculamos el neto
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

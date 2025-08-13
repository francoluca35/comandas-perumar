import { NextResponse } from "next/server";
import { writeToBuffer } from "@fast-csv/format";
import { connectToDatabase } from "@/lib/db";
import { startOfWeek, startOfMonth, isAfter } from "date-fns";

export async function GET(req) {
  try {
    const db = await connectToDatabase();
    const tipo = new URL(req.url).searchParams.get("tipo") || "general";

    const ingresos = await db.collection("ingresosDiarios").find().toArray();
    const retiros = await db.collection("retiroEfectivo").find().toArray();

    const ahora = new Date();
    const inicioSemana = startOfWeek(ahora, { weekStartsOn: 1 }); // lunes
    const inicioMes = startOfMonth(ahora);

    const filtrarPorTipo = (fecha) => {
      const f = new Date(fecha);
      if (tipo === "semana") return isAfter(f, inicioSemana);
      if (tipo === "mes") return isAfter(f, inicioMes);
      return true;
    };

    const agruparPorFecha = {};

    // Agrupar ingresos
    for (const ingreso of ingresos) {
      const fechaObj = new Date(ingreso.timestamp);
      if (isNaN(fechaObj)) continue;
      if (!filtrarPorTipo(fechaObj)) continue;

      const fecha = fechaObj.toISOString().split("T")[0];

      if (!agruparPorFecha[fecha]) {
        agruparPorFecha[fecha] = {
          ingreso: 0,
          retiros: 0,
        };
      }

      agruparPorFecha[fecha].ingreso += ingreso.totalPedido || 0;
    }

    // Agrupar retiros
    for (const retiro of retiros) {
      const fechaObj = new Date(retiro.timestamp);
      if (isNaN(fechaObj)) continue;
      if (!filtrarPorTipo(fechaObj)) continue;

      const fecha = fechaObj.toISOString().split("T")[0];

      if (!agruparPorFecha[fecha]) {
        agruparPorFecha[fecha] = {
          ingreso: 0,
          retiros: 0,
        };
      }

      agruparPorFecha[fecha].retiros += retiro.montoRetirado || 0;
    }

    const rows = Object.entries(agruparPorFecha).map(([fecha, valores]) => ({
      Fecha: fecha,
      Ingreso: valores.ingreso,
      Retiros: valores.retiros,
      Neto: valores.ingreso - valores.retiros,
    }));

    if (!rows.length) {
      return NextResponse.json(
        { error: "No hay datos para ese período" },
        { status: 400 }
      );
    }

    const csvBuffer = await writeToBuffer(rows, { headers: true });

    return new Response(csvBuffer, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=informe-${tipo}.csv`,
      },
    });
  } catch (err) {
    console.error("Error generando Excel:", err);
    return NextResponse.json(
      { error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}

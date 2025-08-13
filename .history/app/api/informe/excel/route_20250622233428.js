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

    const fechaRetiros = (date) => new Date(date).toISOString().split("T")[0];

    const rows = ingresos
      .filter((i) => filtrarPorTipo(i.fecha))
      .map((i) => {
        const fecha =
          i.fecha instanceof Date
            ? i.fecha.toISOString().split("T")[0]
            : i.fecha || "-";

        const ingreso = i.ingresoTotal ?? 0;

        const retirosDeEseDia = retiros.filter(
          (r) => fechaRetiros(r.timestamp) === fecha
        );
        const totalRetiros = retirosDeEseDia.reduce(
          (acc, r) => acc + (r.montoRetirado || 0),
          0
        );

        return {
          Fecha: fecha,
          Ingreso: ingreso,
          Retiros: totalRetiros,
          Neto: ingreso - totalRetiros,
        };
      });

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

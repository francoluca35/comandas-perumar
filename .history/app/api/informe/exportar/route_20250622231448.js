import { NextResponse } from "next/server";
import { writeToBuffer } from "@fast-csv/format";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const ingresos = await db.collection("ingresoDiarios").find().toArray();
    const retiros = await db.collection("retirosEfectivo").find().toArray();

    if (!ingresos.length && !retiros.length) {
      return NextResponse.json(
        { error: "No hay datos para exportar" },
        { status: 400 }
      );
    }

    const rows = ingresos.map((i) => {
      const fecha = i.fecha || "-";
      const ingreso = i.ingresoTotal ?? 0;

      const retirosDeEseDia = retiros.filter((r) => r.fecha === fecha);
      const totalRetiros = retirosDeEseDia.reduce(
        (acc, r) => acc + (r.monto || 0),
        0
      );

      return {
        Fecha: fecha,
        Ingreso: ingreso,
        Retiros: totalRetiros,
        Neto: ingreso - totalRetiros,
      };
    });

    const csvBuffer = await writeToBuffer(rows, { headers: true });

    await db.collection("ingresodiarios").deleteMany({});
    await db.collection("retirosefectivos").deleteMany({});

    return new Response(csvBuffer, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=informe-diario.csv",
      },
    });
  } catch (err) {
    console.error("Error exportando informes:", err);
    return NextResponse.json(
      { error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}

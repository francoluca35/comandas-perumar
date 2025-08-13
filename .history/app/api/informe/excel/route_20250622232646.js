import { NextResponse } from "next/server";
import { writeToBuffer } from "@fast-csv/format";
import { connectToDatabase } from "@/lib/db";

export async function GET(req) {
  try {
    const db = await connectToDatabase();

    const tipo = new URL(req.url).searchParams.get("tipo");
    const ingresos = await db.collection("ingresosDiarios").find().toArray();
    const retiros = await db.collection("retiroEfectivo").find().toArray();

    if (!ingresos.length && !retiros.length) {
      return NextResponse.json(
        { error: "No hay datos para exportar" },
        { status: 400 }
      );
    }

    const fechaRetiros = (date) => new Date(date).toISOString().split("T")[0];

    const rows = ingresos.map((i) => {
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

    const csvBuffer = await writeToBuffer(rows, { headers: true });

    // ✅ Solo después de generar el archivo eliminamos los datos
    await db.collection("ingresosDiarios").deleteMany({});
    await db.collection("retiroEfectivo").deleteMany({});

    return new Response(csvBuffer, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=informe-${tipo}.csv`,
      },
    });
  } catch (err) {
    console.error("Error exportando informe:", err);
    return NextResponse.json(
      { error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}

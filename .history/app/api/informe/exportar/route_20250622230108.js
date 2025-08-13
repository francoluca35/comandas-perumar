import { NextResponse } from "next/server";
import { writeToBuffer } from "@fast-csv/format";
import dbConnect from "@/lib/dbConnect";
import Informe from "@/models/IngresoDiario";

export async function GET() {
  await dbConnect();

  try {
    const informes = await Informe.find({});
    if (!informes || informes.length === 0) {
      return NextResponse.json(
        { error: "No hay datos para exportar" },
        { status: 400 }
      );
    }

    const rows = informes.map((inf) => ({
      Fecha: inf.fecha,
      Ingreso: inf.ingresoTotal,
      Retiros: inf.retirosTotal,
      Neto: inf.neto,
    }));

    const csvBuffer = await writeToBuffer(rows, { headers: true });

    await Informe.deleteMany({});

    return new Response(csvBuffer, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=informe-diario.csv",
      },
    });
  } catch (err) {
    console.error("Error exportando informes:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { writeToBuffer } from "@fast-csv/format";
import dbConnect from "@/lib/dbConnect";
import IngresoDiario from "@/models/IngresoDiario";
import RetiroEfectivo from "@/models/RetiroEfectivo";

export async function GET() {
  await dbConnect();

  try {
    const ingresos = await IngresoDiario.find({});
    const retiros = await RetiroEfectivo.find({});

    if (!ingresos.length && !retiros.length) {
      return NextResponse.json(
        { error: "No hay datos para exportar" },
        { status: 400 }
      );
    }

    const rows = ingresos.map((i) => ({
      Fecha: i.fecha,
      Ingreso: i.ingresoTotal,
      Retiros: i.retirosTotal,
      Neto: i.neto,
    }));

    const csvBuffer = await writeToBuffer(rows, { headers: true });

    await IngresoDiario.deleteMany({});
    await RetiroEfectivo.deleteMany({});

    return new Response(csvBuffer, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=informes.csv",
      },
    });
  } catch (err) {
    console.error("Error exportando informes:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

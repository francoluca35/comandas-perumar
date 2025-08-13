import { NextResponse } from "next/server";
import { writeToBuffer } from "@fast-csv/format";
import dbConnect from "@/lib/mongodb"; // Ajustalo si tenés otro archivo
import Ingreso from "@/models/InformeDiario";
import Retiro from "@/models/RetiroEfectivo";

export async function GET() {
  await dbConnect();

  try {
    const ingresos = await Ingreso.find({});
    const retiros = await Retiro.find({});

    if (ingresos.length === 0 && retiros.length === 0) {
      return NextResponse.json(
        { error: "No hay datos para exportar" },
        { status: 400 }
      );
    }

    // Convertimos los ingresos
    const rows = ingresos.map((i) => ({
      Tipo: "Ingreso",
      Fecha: i.fecha,
      Monto: i.monto,
      Motivo: i.motivo || "",
    }));

    // Agregamos los retiros
    rows.push(
      ...retiros.map((r) => ({
        Tipo: "Retiro",
        Fecha: r.timestamp.toISOString(),
        Monto: r.montoRetirado,
        Motivo: r.motivo,
      }))
    );

    // Ordenar por fecha
    rows.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));

    // Exportar CSV
    const csvBuffer = await writeToBuffer(rows, { headers: true });

    // Eliminar datos de ambas colecciones
    await Ingreso.deleteMany({});
    await Retiro.deleteMany({});

    return new Response(csvBuffer, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=ingresos-retiros.csv",
      },
    });
  } catch (err) {
    console.error("Error exportando:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

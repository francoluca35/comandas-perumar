import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const informe = await db.collection("ingresosDiarios").find().toArray();

    if (!informe.length) {
      return NextResponse.json(
        { error: "No hay datos para exportar" },
        { status: 400 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Informe Diario");

    sheet.columns = [
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Ingresos", key: "ingresoTotal", width: 15 },
      { header: "Retiros", key: "retirosTotal", width: 15 },
      { header: "Neto", key: "neto", width: 15 },
    ];

    informe.forEach((item) => {
      sheet.addRow({
        fecha: item.fecha,
        ingresoTotal: item.ingresoTotal,
        retirosTotal: item.retirosTotal,
        neto: item.neto,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    await db.collection("ingresosDiarios").deleteMany({});

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=informe-diario.xlsx",
      },
    });
  } catch (err) {
    console.error("Error al exportar informe:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

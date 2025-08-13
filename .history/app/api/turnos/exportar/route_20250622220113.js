import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const turnos = await db.collection("turnos").find().toArray();

    if (!turnos.length) {
      return NextResponse.json(
        { error: "No hay turnos para exportar." },
        { status: 404 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Turnos");

    sheet.columns = [
      { header: "Usuario", key: "username", width: 25 },
      { header: "Inicio", key: "inicio", width: 25 },
      { header: "Fin", key: "fin", width: 25 },
    ];

    turnos.forEach((t) => {
      sheet.addRow({
        username: t.username,
        inicio: t.inicio ? new Date(t.inicio).toLocaleString("es-AR") : "-",
        fin: t.fin ? new Date(t.fin).toLocaleString("es-AR") : "-",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    // Borrar todos los turnos después de exportar
    await db.collection("turnos").deleteMany({});

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="turnos_${new Date().toLocaleDateString(
          "es-AR"
        )}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("Error exportando turnos:", err);
    return NextResponse.json(
      { error: "Error al generar el Excel" },
      { status: 500 }
    );
  }
}

import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("comandas");

  const ultima = await db
    .collection("exportaciones")
    .findOne({ tipo: "turnos" });
  const ahora = new Date();
  const hanPasado15Dias =
    !ultima || (ahora - new Date(ultima.fecha)) / (1000 * 60 * 60 * 24) >= 15;

  if (!hanPasado15Dias) {
    return NextResponse.json({ mensaje: "Aún no pasaron 15 días", skip: true });
  }

  const turnos = await db.collection("turnos").find().toArray();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Turnos");

  worksheet.columns = [
    { header: "Usuario", key: "username", width: 20 },
    { header: "Inicio", key: "inicio", width: 25 },
    { header: "Fin", key: "fin", width: 25 },
  ];

  turnos.forEach((t) => {
    worksheet.addRow({
      username: t.username,
      inicio: new Date(t.inicio).toLocaleString("es-AR"),
      fin: t.fin ? new Date(t.fin).toLocaleString("es-AR") : "-",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  // Guardar fecha de exportación
  await db
    .collection("exportaciones")
    .updateOne(
      { tipo: "turnos" },
      { $set: { fecha: new Date() } },
      { upsert: true }
    );

  // Borrar los turnos exportados
  await db.collection("turnos").deleteMany({});

  return new NextResponse(buffer, {
    headers: {
      "Content-Disposition": `attachment; filename="turnos-${new Date().toISOString()}.xlsx"`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}

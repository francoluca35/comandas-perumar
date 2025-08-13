// /app/api/estadisticas/export-top-comidas/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const topComidas = await db
      .collection("datos_clientes")
      .aggregate([
        {
          $project: {
            comida: 1,
            diaSemana: { $dayOfWeek: "$timestamp" },
          },
        },
        {
          $match: {
            diaSemana: { $gte: 2, $lte: 6 }, // Lunes a Viernes
          },
        },
        {
          $group: {
            _id: "$comida",
            cantidad: { $sum: 1 },
          },
        },
        { $sort: { cantidad: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    // Crear el Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Top Comidas");

    sheet.columns = [
      { header: "Comida", key: "comida", width: 30 },
      { header: "Cantidad", key: "cantidad", width: 15 },
    ];

    topComidas.forEach((item) =>
      sheet.addRow({ comida: item._id, cantidad: item.cantidad })
    );

    const buffer = await workbook.xlsx.writeBuffer();

    // Borrar todos los datos
    await db.collection("datos_clientes").deleteMany({});

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=top_comidas.xlsx`,
      },
    });
  } catch (error) {
    console.error("Error generando Excel y borrando datos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// /app/api/estadisticas/descargar-total-anual/route.js
import clientPromise from "@/lib/mongodb";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const ahora = new Date();
    const añoActual = ahora.getFullYear();

    const datos = await db
      .collection("totalMensual")
      .find({ año: añoActual })
      .sort({ mes: 1 })
      .toArray();

    if (!datos || datos.length === 0) {
      return new Response(
        JSON.stringify({ error: "No hay datos del año actual" }),
        {
          status: 404,
        }
      );
    }

    // Crear Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Totales ${añoActual}`);

    sheet.columns = [
      { header: "Mes", key: "mes", width: 15 },
      { header: "Total", key: "total", width: 20 },
    ];

    datos.forEach((item) => {
      sheet.addRow({
        mes: `Mes ${item.mes}`,
        total: item.total,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    // Eliminar los datos del año
    await db.collection("totalMensual").deleteMany({ año: añoActual });

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=Totales_${añoActual}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Error generando Excel anual:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    });
  }
}

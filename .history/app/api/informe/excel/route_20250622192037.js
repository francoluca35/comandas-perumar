import clientPromise from "@/lib/mongodb";
import { format } from "date-fns";
import ExcelJS from "exceljs";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const tipo = req.nextUrl.searchParams.get("tipo");
    const ahora = new Date();
    let desde = new Date();

    if (tipo === "semana") {
      desde.setDate(ahora.getDate() - 7);
    } else {
      desde.setMonth(ahora.getMonth() - 1);
    }

    const retiros = await db
      .collection("retiroEfectivo")
      .find({ timestamp: { $gte: desde } })
      .sort({ timestamp: -1 })
      .toArray();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Retiros");

    sheet.columns = [
      { header: "Fecha", key: "fecha", width: 20 },
      { header: "Hora", key: "hora", width: 15 },
      { header: "Motivo", key: "motivo", width: 30 },
      { header: "Monto", key: "monto", width: 15 },
    ];

    retiros.forEach((r) => {
      const fechaHora = new Date(r.timestamp);
      sheet.addRow({
        fecha: format(fechaHora, "dd/MM/yyyy"),
        hora: format(fechaHora, "HH:mm"),
        motivo: r.motivo,
        monto: r.montoRetirado,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="retiros-${tipo}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("Error al generar Excel:", err);
    return new Response(JSON.stringify({ error: "No se pudo generar Excel" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

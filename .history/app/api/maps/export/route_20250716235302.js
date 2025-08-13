// /app/api/maps/export/route.js
import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import ExcelJS from "exceljs";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    if (!desde || !hasta) {
      return NextResponse.json({ error: "Fechas requeridas" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const pedidos = await db
      .collection("maps")
      .find({
        timestamp: {
          $gte: startOfDay(new Date(desde)),
          $lte: endOfDay(new Date(hasta)),
        },
      })
      .toArray();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Pedidos");

    sheet.columns = [
      { header: "Nombre", key: "nombre", width: 20 },
      { header: "Tipo", key: "tipo", width: 15 },
      { header: "Total", key: "total", width: 10 },
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Pago", key: "formaDePago", width: 15 },
      { header: "Estado", key: "estado", width: 15 },
    ];

    pedidos.forEach((pedido) => {
      sheet.addRow({
        nombre: pedido.nombre,
        tipo: pedido.tipo,
        total: pedido.total,
        fecha: pedido.fecha,
        formaDePago: pedido.formaDePago,
        estado: pedido.estado,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=pedidos_${desde}_a_${hasta}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Error al generar Excel:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// /app/api/maps/export/route.js
import { NextResponse } from "next/server";
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

    const desdeDate = new Date(`${desde}T00:00:00Z`);
    const hastaDate = new Date(`${hasta}T23:59:59Z`);

    const pedidos = await db
      .collection("pedidos")
      .find({
        timestamp: {
          $gte: desdeDate,
          $lte: hastaDate,
        },
      })
      .toArray();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Pedidos");

    sheet.columns = [
      { header: "Nombre", key: "nombre", width: 20 },
      { header: "Tipo", key: "tipo", width: 12 },
      { header: "Forma de Pago", key: "formaDePago", width: 15 },
      { header: "Dirección", key: "direccion", width: 25 },
      { header: "Fecha", key: "fecha", width: 20 },
      { header: "Estado", key: "estado", width: 12 },
      { header: "Observación", key: "observacion", width: 20 },
      { header: "Total", key: "total", width: 10 },
      { header: "Detalle", key: "detalle", width: 40 },
    ];

    pedidos.forEach((pedido) => {
      const detalle = pedido.comidas
        ?.map((item) => {
          let base = `${item.cantidad || 1}x ${item.comida || item.bebida}`;
          if (item.adicionales?.length) {
            base += ` (+ ${item.adicionales.join(", ")})`;
          }
          return base;
        })
        .join(" | ");

      sheet.addRow({
        nombre: pedido.nombre,
        tipo: pedido.tipo,
        formaDePago: pedido.formaDePago,
        direccion: pedido.direccion,
        fecha: pedido.fecha,
        estado: pedido.estado,
        observacion: pedido.observacion,
        total: pedido.total,
        detalle,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    // 🔴 Eliminar los pedidos exportados
    await db.collection("pedidos").deleteMany({
      timestamp: {
        $gte: desdeDate,
        $lte: hastaDate,
      },
    });

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

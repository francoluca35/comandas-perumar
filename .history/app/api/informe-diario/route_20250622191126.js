import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { format } from "date-fns";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const groupByDay = (field, sumField) => [
      {
        $group: {
          _id: { $dateToString: { format: "%d/%m/%Y", date: `$${field}` } },
          total: { $sum: `$${sumField}` },
        },
      },
    ];

    const pedidos = await db
      .collection("pedidos")
      .aggregate(groupByDay("timestamp", "total"))
      .toArray()
      .catch(() => []);
    const mesas = await db
      .collection("tables")
      .aggregate(groupByDay("timestamp", "total"))
      .toArray()
      .catch(() => []);
    const ingresosDiarios = await db
      .collection("ingresosDiarios")
      .aggregate(groupByDay("timestamp", "totalPedido"))
      .toArray()
      .catch(() => []);
    const retiros = await db
      .collection("retiroEfectivo")
      .find()
      .toArray()
      .catch(() => []);

    // Armamos resumen por fecha
    const resumen = {};

    const mergeData = (data, tipo) => {
      data.forEach((item) => {
        const fecha = item._id;
        if (!resumen[fecha])
          resumen[fecha] = { ingresos: 0, retiros: 0, detalles: [] };
        if (tipo === "retiro") resumen[fecha].retiros += item.total;
        else resumen[fecha].ingresos += item.total;
      });
    };

    mergeData(pedidos, "ingreso");
    mergeData(mesas, "ingreso");
    mergeData(ingresosDiarios, "ingreso");

    // Agregamos detalle de retiros por fecha
    retiros.forEach((r) => {
      const fecha = format(new Date(r.timestamp), "dd/MM/yyyy");
      const hora = format(new Date(r.timestamp), "HH:mm");
      if (!resumen[fecha])
        resumen[fecha] = { ingresos: 0, retiros: 0, detalles: [] };
      resumen[fecha].retiros += r.montoRetirado;
      resumen[fecha].detalles.push({
        hora,
        monto: r.montoRetirado,
        motivo: r.motivo,
      });
    });

    const resultado = Object.entries(resumen).map(([fecha, valores]) => ({
      fecha,
      ingresoTotal: valores.ingresos,
      retirosTotal: valores.retiros,
      neto: valores.ingresos - valores.retiros,
      retiros: valores.detalles.sort((a, b) => (a.hora < b.hora ? 1 : -1)), // orden descendente por hora
    }));

    return NextResponse.json(resultado);
  } catch (err) {
    console.error("Error en informe-diario:", err);
    return NextResponse.json([], { status: 200 });
  }
}

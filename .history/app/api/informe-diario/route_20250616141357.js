import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    // Pipeline universal para todas las colecciones
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
      .aggregate(groupByDay("timestamp", "montoRetirado"))
      .toArray()
      .catch(() => []);

    const resumen = {};

    const mergeData = (data, tipo) => {
      data.forEach((item) => {
        const fecha = item._id;
        if (!resumen[fecha]) resumen[fecha] = { ingresos: 0, retiros: 0 };
        if (tipo === "retiro") resumen[fecha].retiros += item.total;
        else resumen[fecha].ingresos += item.total;
      });
    };

    mergeData(pedidos, "ingreso");
    mergeData(mesas, "ingreso");
    mergeData(ingresosDiarios, "ingreso");
    mergeData(retiros, "retiro");

    const resultado = Object.entries(resumen).map(([fecha, valores]) => ({
      fecha,
      ingresoTotal: valores.ingresos,
      retirosTotal: valores.retiros,
      neto: valores.ingresos - valores.retiros,
    }));

    return NextResponse.json(resultado);
  } catch (err) {
    console.error("Error en informe-diario:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const { totalPedido, timestamp } = await req.json();

    if (!totalPedido || !timestamp) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    await db.collection("ingresosDiarios").insertOne({
      totalPedido: parseFloat(totalPedido),
      timestamp: new Date(timestamp),
    });

    return NextResponse.json({ message: "Ingreso guardado correctamente" });
  } catch (err) {
    console.error("Error guardando ingreso diario:", err);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

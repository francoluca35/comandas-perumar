import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "7", 10);
    const skip = (page - 1) * limit;

    // Fechas únicas por día (últimos N días con actividad)
    const fechas = await db
      .collection("ingresosDiarios")
      .aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
          },
        },
        { $sort: { _id: -1 } },
        { $skip: skip },
        { $limit: limit },
      ])
      .toArray();

    const resumen = await Promise.all(
      fechas.map(async (f) => {
        const inicio = new Date(f._id + "T00:00:00");
        const fin = new Date(f._id + "T23:59:59");

        // Ingresos
        const ingresos = await db
          .collection("ingresosDiarios")
          .aggregate([
            {
              $match: {
                timestamp: { $gte: inicio, $lte: fin },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$totalPedido" },
              },
            },
          ])
          .toArray();

        const ingresoTotal = ingresos[0]?.total || 0;

        // Retiros
        const retirosDocs = await db
          .collection("retiroEfectivo")
          .find({
            timestamp: { $gte: inicio, $lte: fin },
          })
          .toArray();

        const retirosTotal = retirosDocs.reduce(
          (sum, r) => sum + (r.montoRetirado || 0),
          0
        );

        // Cierre caja
        const cierre = await db.collection("cierresCaja").findOne({
          fechaCierre: f._id,
        });

        return {
          fecha: f._id,
          ingresoTotal,
          retirosTotal,
          neto: ingresoTotal - retirosTotal,
          retiros: retirosDocs.map((r) => ({
            monto: r.montoRetirado,
            motivo: r.motivo,
            hora: new Date(r.timestamp).toLocaleTimeString("es-AR"),
          })),
          cierreCaja: cierre?.saldoEnCaja ?? null,
          horaCierre: cierre?.horaCierre ?? null,
        };
      })
    );

    return NextResponse.json({ data: resumen });
  } catch (error) {
    console.error("Error informe diario:", error);
    return NextResponse.json(
      { error: "Error al generar informe diario" },
      { status: 500 }
    );
  }
}

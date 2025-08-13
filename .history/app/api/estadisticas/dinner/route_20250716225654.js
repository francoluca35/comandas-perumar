import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const pipeline = [
      {
        $project: {
          total: "$totalPedido",
          timestamp: 1,
          dia: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          semana: { $isoWeek: "$timestamp" },
          mes: { $month: "$timestamp" },
          año: { $year: "$timestamp" },
        },
      },
      {
        $facet: {
          porDia: [
            {
              $group: {
                _id: "$dia",
                total: { $sum: "$total" },
              },
            },
            { $sort: { _id: -1 } },
          ],
          porSemana: [
            {
              $group: {
                _id: { año: "$año", semana: "$semana" },
                total: { $sum: "$total" },
              },
            },
            { $sort: { "_id.año": -1, "_id.semana": -1 } },
          ],
          porMes: [
            {
              $group: {
                _id: { año: "$año", mes: "$mes" },
                total: { $sum: "$total" },
              },
            },
            { $sort: { "_id.año": -1, "_id.mes": -1 } },
          ],
        },
      },
    ];

    const resultado = await db
      .collection("ingresosDiarios")
      .aggregate(pipeline)
      .toArray();

    // ✅ Guardar total mensual solo si no existe en la colección totalMensual
    const totalMesActual = resultado[0].porMes?.[0];

    if (totalMesActual) {
      const yaExiste = await db.collection("totalMensual").findOne({
        año: totalMesActual._id.año,
        mes: totalMesActual._id.mes,
      });

      if (!yaExiste) {
        await db.collection("totalMensual").insertOne({
          año: totalMesActual._id.año,
          mes: totalMesActual._id.mes,
          total: totalMesActual.total,
          creadoEn: new Date(),
        });
      }
    }

    return new Response(JSON.stringify(resultado[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error en /estadisticas/dinner:", err);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    });
  }
}

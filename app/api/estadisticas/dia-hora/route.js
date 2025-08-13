import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const resultado = await db
      .collection("ingresosDiarios")
      .aggregate([
        {
          $project: {
            fecha: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$timestamp",
                timezone: "America/Argentina/Buenos_Aires",
              },
            },
          },
        },
        {
          $group: {
            _id: "$fecha",
            cantidad: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generando cantidad por fecha:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    });
  }
}

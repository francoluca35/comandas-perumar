export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const hoy = new Date();
    const inicioDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    );
    const finDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate() + 1
    );

    // Ingresos
    const ingresos = await db
      .collection("ingresosDiarios")
      .aggregate([
        { $match: { timestamp: { $gte: inicioDia, $lt: finDia } } },
        { $group: { _id: null, total: { $sum: "$totalPedido" } } },
      ])
      .toArray();
    const totalIngresos = ingresos[0]?.total || 0;

    // Retiros
    const retiros = await db
      .collection("retiroEfectivo")
      .aggregate([
        { $match: { timestamp: { $gte: inicioDia, $lt: finDia } } },
        { $group: { _id: null, total: { $sum: "$montoRetirado" } } },
      ])
      .toArray();
    const totalRetiros = retiros[0]?.total || 0;

    const neto = totalIngresos - totalRetiros;

    // Saldo actual de caja
    const caja = await db.collection("cajaRegistradora").findOne({});
    const saldoEnCaja = caja?.montoActual || 0;

    // Guardar el cierre
    await db.collection("cierresCaja").insertOne({
      fechaCierre: hoy.toLocaleDateString("es-AR"),
      horaCierre: hoy.toLocaleTimeString("es-AR"),
      totalIngresos,
      totalRetiros,
      neto,
      saldoEnCaja,
      timestamp: new Date(),
    });

    // 🔴 Reiniciar el monto en caja a 0
    await db.collection("cajaRegistradora").updateOne(
      {},
      {
        $set: {
          montoActual: 0,
          fechaActualizacion: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Cierre realizado correctamente",
      cierre: { totalIngresos, totalRetiros, neto, saldoEnCaja },
    });
  } catch (err) {
    console.error("Error al realizar cierre:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

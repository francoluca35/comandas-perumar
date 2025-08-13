import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    const db = await connectToDatabase();

    const ingresos = await db.collection("ingresosDiarios").find().toArray();
    const retiros = await db.collection("retiroEfectivo").find().toArray();

    const agruparPorFecha = {};

    // Agrupar ingresos
    for (const ingreso of ingresos) {
      if (!ingreso.fecha) continue;
      const fecha = new Date(ingreso.fecha);
      if (isNaN(fecha)) continue;

      const fechaStr = fecha.toISOString().split("T")[0];

      if (!agruparPorFecha[fechaStr]) {
        agruparPorFecha[fechaStr] = {
          fecha: fechaStr,
          ingresoTotal: 0,
          retirosTotal: 0,
          neto: 0,
          retiros: [],
        };
      }

      agruparPorFecha[fechaStr].ingresoTotal += ingreso.ingresoTotal || 0;
    }

    // Agrupar retiros
    for (const retiro of retiros) {
      if (!retiro.timestamp) continue;
      const fecha = new Date(retiro.timestamp);
      if (isNaN(fecha)) continue;

      const fechaStr = fecha.toISOString().split("T")[0];
      const hora = fecha.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (!agruparPorFecha[fechaStr]) {
        agruparPorFecha[fechaStr] = {
          fecha: fechaStr,
          ingresoTotal: 0,
          retirosTotal: 0,
          neto: 0,
          retiros: [],
        };
      }

      const monto = retiro.montoRetirado || 0;
      const motivo = retiro.motivo || "Sin motivo";

      agruparPorFecha[fechaStr].retirosTotal += monto;
      agruparPorFecha[fechaStr].retiros.push({ hora, monto, motivo });
    }

    // Calcular neto
    Object.values(agruparPorFecha).forEach((dia) => {
      dia.neto = dia.ingresoTotal - dia.retirosTotal;
    });

    const resultadoOrdenado = Object.values(agruparPorFecha).sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );

    return NextResponse.json(resultadoOrdenado);
  } catch (err) {
    console.error("Error en informe diario:", err);
    return NextResponse.json(
      { error: "Error interno en el informe diario" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { ingresoTotal } = body;

    if (!ingresoTotal || ingresoTotal <= 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    const db = await connectToDatabase();

    await db.collection("ingresosDiarios").insertOne({
      ingresoTotal,
      fecha: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error al guardar ingreso diario:", err);
    return NextResponse.json(
      { error: "Error al guardar ingreso" },
      { status: 500 }
    );
  }
}

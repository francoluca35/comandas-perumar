import { connectDB } from "@/lib/mongodb";
import Caja from "@/models/Caja";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    await connectDB();
    const { monto } = req.body;

    const caja = await Caja.findOne(); // solo 1 caja activa
    if (!caja) return res.status(404).json({ error: "Caja no encontrada" });

    caja.montoActual += parseFloat(monto || 0);
    await caja.save();

    res.status(200).json({ success: true, nuevoMonto: caja.montoActual });
  } catch (error) {
    console.error("Error al actualizar caja:", error);
    res.status(500).json({ error: "Error al actualizar caja" });
  }
}

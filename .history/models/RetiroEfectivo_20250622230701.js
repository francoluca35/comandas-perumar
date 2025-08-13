import mongoose from "mongoose";

const RetiroEfectivoSchema = new mongoose.Schema({
  montoRetirado: Number,
  antiguoMonto: Number,
  montoActualizado: Number,
  motivo: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.RetiroEfectivo ||
  mongoose.model("RetiroEfectivo", RetiroEfectivoSchema);

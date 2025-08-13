import mongoose from "mongoose";

const RetiroSchema = new mongoose.Schema({
  hora: String,
  monto: Number,
  motivo: String,
});

const InformeSchema = new mongoose.Schema({
  fecha: String,
  ingresoTotal: Number,
  retirosTotal: Number,
  neto: Number,
  retiros: [RetiroSchema],
});

export default mongoose.models.Informe ||
  mongoose.model("Informe", InformeSchema);

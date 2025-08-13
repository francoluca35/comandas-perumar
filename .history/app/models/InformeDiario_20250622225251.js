import mongoose from "mongoose";

const InformeSchema = new mongoose.Schema({
  fecha: String,
  ingresoTotal: Number,
  retirosTotal: Number,
  neto: Number,
  retiros: [
    {
      hora: String,
      monto: Number,
      motivo: String,
    },
  ],
});

export default mongoose.models.Informe ||
  mongoose.model("Informe", InformeSchema);

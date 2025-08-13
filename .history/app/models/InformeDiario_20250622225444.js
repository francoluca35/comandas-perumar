import mongoose from "mongoose";

const InformeDiarioSchema = new mongoose.Schema({
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

export default mongoose.models.InformeDiario ||
  mongoose.model("InformeDiario", InformeDiarioSchema);

import mongoose from "mongoose";

const pagoSchema = new mongoose.Schema(
  {
    referencia: String,
    total: Number,
    status: String,
  },
  { timestamps: true }
);

export default mongoose.models.Pago || mongoose.model("Pago", pagoSchema);

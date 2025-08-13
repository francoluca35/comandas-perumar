// app/api/mercado-pago/webhook/route.js
export const runtime = "nodejs";
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    const tipo = body.type || body.action;
    const paymentId = body.data?.id;

    if (tipo === "payment" && paymentId) {
      const payment = await mercadopago.payment.findById(paymentId);

      if (payment.body.status === "approved") {
        const referencia = payment.body.external_reference; // ej: mesa-3
        const total = payment.body.transaction_amount;
        const metodo = "Mercado Pago";

        console.log("✅ Pago aprobado:", referencia);

        // 🔸 IMPRIMIR EL TICKET
        await fetch("http://192.168.1.100:4000/print", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mesa: referencia,
            productos: [], // opcional: si podés recuperar los productos de la DB
            total,
            metodo,
          }),
        });

        // 🔸 LIBERAR LA MESA
        await fetch("http://localhost:3000/api/mesas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codigo: referencia,
            productos: [],
            metodoPago: metodo,
            total,
            estado: "libre",
            hora: "",
            fecha: "",
          }),
        });

        // 🔸 REGISTRAR EN CAJA
        await fetch("http://localhost:3000/api/caja/ingreso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo: "restaurante",
            monto: total,
            descripcion: `Ingreso automático ${referencia}`,
            metodo: "mercado pago",
          }),
        });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return new Response("Error interno", { status: 500 });
  }
}

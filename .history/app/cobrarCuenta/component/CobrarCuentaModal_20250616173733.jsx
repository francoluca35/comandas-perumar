"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

export default function CobrarCuentaModal({
  onClose,
  mesa,
  productos,
  total,
  nombreCliente,
  refetch,
}) {
  const [paso, setPaso] = useState("seleccion");
  const [metodo, setMetodo] = useState("");
  const [montoPagado, setMontoPagado] = useState("");
  const [vuelto, setVuelto] = useState(0);
  const [urlPago, setUrlPago] = useState("");
  const [preferenceId, setPreferenceId] = useState("");

  const subtotal = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const descuento = productos.reduce(
    (acc, p) => acc + (p.descuento || 0) * p.cantidad,
    0
  );
  const iva = (subtotal - descuento) * 0.18;
  const totalFinal = subtotal - descuento + iva;

  useEffect(() => {
    const pago = parseFloat(montoPagado);
    if (!isNaN(pago)) setVuelto((pago - totalFinal).toFixed(2));
    else setVuelto(0);
  }, [montoPagado, totalFinal]);

  const generarPagoMP = async () => {
    try {
      const res = await fetch("/api/mercado-pago/crear-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total: totalFinal,
          mesa: mesa.numero,
          nombreCliente: nombreCliente || "Cliente",
        }),
      });
      const data = await res.json();
      setUrlPago(data.init_point);
      setPreferenceId(data.preference_id);
    } catch (err) {
      console.error("Error crear pago:", err);
    }
  };

  useEffect(() => {
    if (paso === "qr") generarPagoMP();
  }, [paso]);

  useEffect(() => {
    let interval;
    if (paso === "qr" && preferenceId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/mercado-pago/estado-pago?id=${preferenceId}`
          );
          const data = await res.json();
          if (data.status === "approved") {
            clearInterval(interval);
            setMetodo("Mercado Pago");
            confirmarPago();
          }
        } catch {}
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [paso, preferenceId]);

  const imprimirTicket = () => {
    const html = `
      <html>
      <body onload="window.print();setTimeout(()=>window.close(),500);">
        <h2>Ticket</h2>
        <p>Mesa: ${mesa.numero}</p>
        <p>Total: $${totalFinal.toFixed(2)}</p>
        <p>Pago: ${metodo}</p>
      </body></html>`;
    const win = window.open("", "", "width=300,height=400");
    win.document.write(html);
  };

  const confirmarPago = async () => {
    imprimirTicket();

    if (metodo === "Efectivo") {
      await fetch("/api/cobro-efectivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPedido: totalFinal,
          pagoCliente: parseFloat(montoPagado),
        }),
      });
    }

    await fetch("/api/mesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: mesa.codigo,
        productos: [],
        metodoPago,
        total: 0,
        estado: "libre",
        hora: "",
        fecha: "",
      }),
    });

    refetch?.();
    onClose();
  };

  if (paso === "seleccion") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-700">
            Seleccionar método de pago
          </h2>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                setMetodo("Efectivo");
                setPaso("efectivo");
              }}
              className="py-3 w-full rounded-xl bg-green-500 hover:bg-green-600 text-white text-lg font-semibold shadow-md transition"
            >
              💵 Efectivo
            </button>

            <button
              onClick={() => {
                setMetodo("Mercado Pago");
                setPaso("qr");
              }}
              className="py-3 w-full rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold shadow-md transition"
            >
              💳 Mercado Pago
            </button>

            <button
              onClick={onClose}
              className="py-3 w-full rounded-xl bg-gray-400 hover:bg-gray-500 text-black text-lg font-semibold transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paso === "efectivo") {
    return (
      <div className="modal">
        <h2>Cobro en efectivo</h2>
        <input
          type="number"
          placeholder="Monto"
          value={montoPagado}
          onChange={(e) => setMontoPagado(e.target.value)}
        />
        <p>Vuelto: ${vuelto}</p>
        <button onClick={confirmarPago}>Confirmar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    );
  }

  if (paso === "qr") {
    return (
      <div className="modal">
        <h2>Pagar con Mercado Pago</h2>
        {urlPago ? (
          <>
            <QRCode value={urlPago} size={200} />
            <a href={urlPago} target="_blank">
              Pagar ahora
            </a>
          </>
        ) : (
          <p>Generando QR...</p>
        )}
        <button onClick={onClose}>Cancelar</button>
      </div>
    );
  }
}

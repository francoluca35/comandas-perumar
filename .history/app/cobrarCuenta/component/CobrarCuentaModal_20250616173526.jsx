"use client";

import { useEffect, useState } from "react";
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
    if (!isNaN(pago)) {
      setVuelto((pago - totalFinal).toFixed(2));
    } else {
      setVuelto(0);
    }
  }, [montoPagado, totalFinal]);

  // ✅ Acá generamos el QR de Mercado Pago
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
    } catch (error) {
      console.error("Error al generar preferencia MP:", error);
    }
  };

  // ✅ Genera QR al cambiar al paso de QR
  useEffect(() => {
    if (paso === "qr") {
      generarPagoMP();
    }
  }, [paso]);

  // ✅ Polling de pago confirmado
  useEffect(() => {
    let intervalo;
    if (paso === "qr" && preferenceId) {
      intervalo = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/mercado-pago/estado-pago?id=${preferenceId}`
          );
          const data = await res.json();
          if (data.status === "approved") {
            clearInterval(intervalo);
            setMetodo("Mercado Pago");
            confirmarPago();
          }
        } catch (err) {
          console.error("Error chequeando pago:", err);
        }
      }, 4000);
    }
    return () => clearInterval(intervalo);
  }, [paso, preferenceId]);

  // ✅ Imprimir ticket
  const imprimirTicket = () => {
    const html = `
      <html>
        <body onload="window.print(); setTimeout(()=>window.close(), 500);">
          <h2>Ticket Perú Mar</h2>
          <p>Mesa: ${mesa.numero}</p>
          <p>Total: $${totalFinal.toFixed(2)}</p>
          <p>Pago: ${metodo}</p>
        </body>
      </html>`;
    const win = window.open("", "", "width=300,height=400");
    win.document.write(html);
  };

  // ✅ Confirmar pago (liberar mesa + imprimir + actualizar caja)
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

  // ✅ Pantalla de selección de método
  if (paso === "seleccion") {
    return (
      <div className="modal">
        <h2>Selecciona el método de pago</h2>
        <button
          onClick={() => {
            setMetodo("Efectivo");
            setPaso("efectivo");
          }}
        >
          Efectivo
        </button>
        <button
          onClick={() => {
            setMetodo("Mercado Pago");
            setPaso("qr");
          }}
        >
          Mercado Pago
        </button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    );
  }

  // ✅ Pantalla de pago con efectivo
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

  // ✅ Pantalla de pago QR MercadoPago
  if (paso === "qr") {
    return (
      <div className="modal">
        <h2>Pagar con Mercado Pago</h2>
        {urlPago ? (
          <>
            <QRCode value={urlPago} size={200} />
            <a href={urlPago} target="_blank" rel="noopener noreferrer">
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

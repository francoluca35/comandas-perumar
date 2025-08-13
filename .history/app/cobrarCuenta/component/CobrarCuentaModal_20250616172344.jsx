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
      setPreferenceId(data.preference_id); // <-- GUARDAMOS EL ID
    } catch (error) {
      console.error("Error al generar preferencia MP:", error);
    }
  };

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
        } catch (error) {
          console.error("Error al consultar estado:", error);
        }
      }, 4000);
    }

    return () => clearInterval(interval);
  }, [paso, preferenceId]);

  const imprimirTicket = (orden, metodoPago, hora, fecha) => {
    const html = `
    <html>
      <head>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { width: 320px; font-family: monospace; font-size: 11px; text-align: center; margin: 0; padding: 5px; }
          h2 { margin: 5px 0; font-size: 14px; }
          img.logo { width: 80px; margin-bottom: 5px; filter: grayscale(100%); }
          hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
          .item { display: flex; justify-content: space-between; margin: 2px 0; }
          .small { font-size: 9px; margin-top: 5px; }
        </style>
      </head>
      <body>
        <img src="${
          window.location.origin
        }/Assets/logo-oficial.png" class="logo" />
        <h2>🍽️ Perú Mar</h2>
        <p><strong>Mesa:</strong> ${mesa.numero}</p>
        <p><strong>Orden #:</strong> ${orden}</p>
        <p><strong>Hora:</strong> ${hora}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <hr />
        ${productos
          .map(
            (p) => `
          <div class="item">
            <span>${p.cantidad}x ${p.nombre}</span>
            <span>$${(p.precio * p.cantidad).toFixed(2)}</span>
          </div>
        `
          )
          .join("")}
        <hr />
        <div class="item"><span>Subtotal:</span><span>$${subtotal.toFixed(
          2
        )}</span></div>
        <div class="item"><span>Descuento:</span><span>-$${descuento.toFixed(
          2
        )}</span></div>
        <div class="item"><strong>Total:</strong><strong>$${totalFinal.toFixed(
          2
        )}</strong></div>
        <div class="item"><span>Pago:</span><span>${metodoPago}</span></div>
        ${
          metodoPago === "Efectivo"
            ? `<div class="item"><span>Pagó:</span><span>$${parseFloat(
                montoPagado
              ).toFixed(2)}</span></div>
             <div class="item"><span>Vuelto:</span><span>$${vuelto}</span></div>`
            : ""
        }
        <hr />
        <p class="small"><strong>Tel:</strong> 1140660136</p>
        <p class="small"><strong>Dirección:</strong> Rivera 2525 V. Celina</p>
        <p class="small">Gracias por su visita!</p>
        <script>window.onload = function() { window.print(); setTimeout(() => window.close(), 300); };</script>
      </body>
    </html>`;

    const nuevaVentana = window.open("", "Ticket", "width=400,height=600");
    nuevaVentana.document.write(html);
    nuevaVentana.document.close();
  };

  const confirmarPago = async () => {
    const orden = Date.now();
    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fecha = new Date().toLocaleDateString("es-AR");

    imprimirTicket(orden, metodo, hora, fecha);

    if (metodo === "Efectivo") {
      try {
        await fetch("/api/cobro-efectivo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            totalPedido: totalFinal,
            pagoCliente: parseFloat(montoPagado),
          }),
        });
      } catch (err) {
        console.error("Error al actualizar caja:", err);
      }
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

  // Render paso Efectivo
  if (paso === "efectivo") {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-white text-black rounded-xl p-6 w-full max-w-sm space-y-4">
          <h2 className="text-lg font-semibold text-center">
            Cobro en efectivo
          </h2>
          <p className="text-center">
            Total a cobrar: <strong>${totalFinal.toFixed(2)}</strong>
          </p>
          <input
            type="number"
            placeholder="¿Con cuánto paga?"
            className="w-full p-2 border rounded bg-white"
            value={montoPagado}
            onChange={(e) => setMontoPagado(e.target.value)}
          />
          <p className="text-center">
            Vuelto: <strong>${vuelto}</strong>
          </p>
          <button
            onClick={confirmarPago}
            className="w-full py-2 bg-green-600 text-white rounded-lg"
          >
            Confirmar y imprimir
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-400 text-black rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Render paso Mercado Pago
  if (paso === "qr") {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-white text-black rounded-xl p-6 w-full max-w-sm space-y-4">
          <h2 className="text-lg font-semibold text-center">
            Pagar con Mercado Pago
          </h2>
          {urlPago ? (
            <>
              <QRCode value={urlPago} size={200} />
              <a
                href={urlPago}
                target="_blank"
                className="block mt-4 bg-blue-500 text-white text-center p-2 rounded-lg"
              >
                Pagar ahora
              </a>
            </>
          ) : (
            <p>Generando QR...</p>
          )}
          <button
            onClick={onClose}
            className="w-full mt-4 py-2 bg-gray-400 text-black rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Render menú de selección
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-xl p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold text-center">
          Selecciona el método de pago
        </h2>
        <button
          onClick={() => {
            setMetodo("Efectivo");
            setPaso("efectivo");
          }}
          className="w-full py-2 bg-green-600 text-white rounded-lg"
        >
          Efectivo
        </button>
        <button
          onClick={() => {
            setMetodo("Mercado Pago");
            setPaso("qr");
          }}
          className="w-full py-2 bg-blue-600 text-white rounded-lg"
        >
          Mercado Pago
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 bg-gray-400 text-black rounded-lg"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

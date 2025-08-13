"use client";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import Swal from "sweetalert2";

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
  const [externalReference, setExternalReference] = useState("");

  const subtotal = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const descuento = productos.reduce(
    (acc, p) => acc + (p.descuento || 0) * p.cantidad,
    0
  );
  const totalFinal = subtotal - descuento;

  useEffect(() => {
    const pago = parseFloat(montoPagado);
    setVuelto(!isNaN(pago) ? (pago - totalFinal).toFixed(2) : 0);
  }, [montoPagado, totalFinal]);

  const generarPagoMP = async () => {
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
    setExternalReference(data.external_reference);
  };

  useEffect(() => {
    if (paso === "qr" || paso === "link") generarPagoMP();
  }, [paso]);

  useEffect(() => {
    let interval;
    if ((paso === "qr" || paso === "link") && externalReference) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/mercado-pago/estado/${externalReference}`
          );
          const data = await res.json();

          if (data.status === "approved") {
            clearInterval(interval);

            Swal.fire({
              icon: "success",
              title: "Pago aprobado",
              text: "El pago fue confirmado.",
              timer: 2000,
              showConfirmButton: false,
            }).then(() => {
              setMetodo("Mercado Pago");
              imprimirTicket();
              confirmarPago();
              onClose();
            });
          }
        } catch (err) {
          console.error("Error al consultar estado del pago:", err);
        }
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [paso, externalReference]);

  useEffect(() => {
    if (paso === "finalizado" && metodo === "Mercado Pago") {
      imprimirTicket();
      confirmarPago();
    }
  }, [paso]);

  const imprimirTicket = () => {
    const fecha = new Date().toLocaleDateString("es-AR");
    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const orden = Date.now();

    const html = `
      <html>
        <head>
          <style>
            @page { size: 58mm auto; margin: 0; }
            @media print {
              html, body {
                width: 54mm;
                margin: 0;
                padding: 0;
                transform: scale(0.90);
                transform-origin: top left;
              }
            }
            body {
              font-family: monospace;
              font-size: 12px;
              width: 52mm;
              margin: 0;
              text-align: center;
            }
            h2 { margin: 5px 0; font-size: 14px; }
            .logo { width: 80px; margin-bottom: 5px; }
            hr { border: none; border-top: 1px dashed #000; margin: 5px 0; }
            .item { display: flex; justify-content: space-between; margin: 2px 0; }
            .total { font-weight: bold; font-size: 14px; }
            .footer { font-size: 10px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <img src="${
            window.location.origin
          }/Assets/logo-oficial.png" class="logo" />
          <h2>🍽️ Perú Mar</h2>
          <h1>Mesa: ${mesa.numero}</h1>
          <h1>Orden #: ${orden}</h1>
          <h1>Hora: ${hora}</h1>
          <h1>Fecha: ${fecha}</h1>
          <hr />
          ${productos
            .map(
              (p) => `<div class="item">
                        <span>${p.cantidad}x ${p.nombre}</span>
                        <span>$${(p.precio * p.cantidad).toFixed(2)}</span>
                      </div>`
            )
            .join("")}
          <hr />
          <div class="item"><span>Subtotal:</span><span>$${subtotal.toFixed(
            2
          )}</span></div>
          <div class="item"><span>Descuento:</span><span>-$${descuento.toFixed(
            2
          )}</span></div>
          <div class="item total"><span>Total:</span><span>$${totalFinal.toFixed(
            2
          )}</span></div>
          <div class="item"><span>Pago:</span><span>${metodo}</span></div>
          ${
            metodo === "Efectivo"
              ? `<div class="item"><span>Pagó:</span><span>$${parseFloat(
                  montoPagado
                ).toFixed(2)}</span></div>
                 <div class="item"><span>Vuelto:</span><span>$${vuelto}</span></div>`
              : ""
          }
          <hr />
          <div class="footer">
            <h1>Tel: 1140660136</h1>
            <h1>Dirección: Rivera 2495 V. Celina</h1>
            <h1>Gracias por su visita!</h1>
          </div>
          <script>window.onload = function() { window.print(); setTimeout(()=>window.close(), 500); }</script>
        </body>
      </html>
    `;

    const ventana = window.open("", "", "width=400,height=600");
    if (ventana) ventana.document.write(html);
  };

  const confirmarPago = async () => {
    if (metodo === "Efectivo") {
      imprimirTicket();
      await fetch("/api/caja/ingreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "restaurante",
          monto: totalFinal,
          descripcion: `Ingreso por mesa ${mesa.numero}`,
          metodo: "efectivo",
        }),
      });
    }

    await fetch("/api/mesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: mesa.codigo,
        productos: [],
        metodoPago: metodo,
        total,
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
        <div className="bg-white rounded-2xl p-6 space-y-4 w-full max-w-md shadow-lg">
          <h2 className="text-center text-xl font-bold text-gray-800">
            Seleccionar método de pago
          </h2>
          <button
            onClick={() => {
              setMetodo("Efectivo");
              setPaso("efectivo");
            }}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold"
          >
            💵 Efectivo
          </button>
          <button
            onClick={() => {
              setMetodo("Mercado Pago");
              setPaso("qr");
            }}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold"
          >
            📱 Pagar con QR
          </button>
          <button
            onClick={() => {
              setMetodo("Mercado Pago");
              setPaso("link");
            }}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold"
          >
            🌐 Obtener link de pago
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-400 hover:bg-gray-500 text-black rounded-xl font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (paso === "efectivo") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 space-y-4 w-full max-w-md shadow-lg">
          <h2 className="text-center text-xl font-bold text-gray-800">
            Cobro en efectivo
          </h2>
          <p className="text-center text-lg">
            Total: <b>${totalFinal.toFixed(2)}</b>
          </p>
          <input
            type="number"
            placeholder="¿Con cuánto paga?"
            className="w-full p-3 rounded border text-lg"
            value={montoPagado}
            onChange={(e) => setMontoPagado(e.target.value)}
          />
          <p className="text-center">
            Vuelto: <span className="text-green-600">${vuelto}</span>
          </p>
          <button
            onClick={confirmarPago}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold"
          >
            Confirmar e imprimir
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-400 hover:bg-gray-500 text-black rounded-xl font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (paso === "qr") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 space-y-4 w-full max-w-md shadow-lg">
          <h2 className="text-center text-xl font-bold text-gray-800">
            Pagar con QR
          </h2>
          {urlPago ? (
            <>
              <div className="flex justify-center">
                <QRCode value={urlPago} size={200} />
              </div>
              <a
                href={urlPago}
                target="_blank"
                className="block text-center text-blue-500 underline"
              >
                Ir al pago
              </a>
            </>
          ) : (
            <p className="text-center text-gray-600 animate-pulse">
              Generando QR...
            </p>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-400 hover:bg-gray-500 text-black rounded-xl font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (paso === "link") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 space-y-4 w-full max-w-md shadow-lg">
          <h2 className="text-center text-xl font-bold text-gray-800">
            Link de pago
          </h2>
          {urlPago ? (
            <a
              href={urlPago}
              target="_blank"
              className="block w-full py-3 text-center bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold"
            >
              Ir al link de pago
            </a>
          ) : (
            <p className="text-center text-gray-600 animate-pulse">
              Generando link...
            </p>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-400 hover:bg-gray-500 text-black rounded-xl font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }
}

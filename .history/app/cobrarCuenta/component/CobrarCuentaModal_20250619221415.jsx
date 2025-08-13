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
  const [externalReference, setExternalReference] = useState("");

  const subtotal = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const descuento = productos.reduce(
    (acc, p) => acc + (p.descuento || 0) * p.cantidad,
    0
  );
  const iva = (subtotal - descuento) * 0.18;
  const totalFinal = subtotal - descuento + iva;

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
    if (paso === "qr") generarPagoMP();
  }, [paso]);

  useEffect(() => {
    let interval;
    if (paso === "qr" && externalReference) {
      interval = setInterval(async () => {
        const res = await fetch(
          `/api/mercado-pago/estado/${externalReference}`
        );
        const data = await res.json();
        if (data.status === "approved") {
          clearInterval(interval);
          setMetodo("Mercado Pago");
          setPaso("finalizado");
        }
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [paso, externalReference]);

  useEffect(() => {
    if (paso === "finalizado") {
      imprimirTicket();
      confirmarPago();
    }
  }, [paso]);

  const imprimirTicket = () => {
    const fecha = new Date().toLocaleDateString("es-AR");
    function obtenerHoraActual() {
      const ahora = new Date();
      const horas = String(ahora.getHours()).padStart(2, "0");
      const minutos = String(ahora.getMinutes()).padStart(2, "0");
      return `${horas}:${minutos}`;
    }

    const hora = obtenerHoraActual();

    const orden = Date.now();

    const html = `
      <html>
        <head>
<style>
  /* 1. Tamaño de página exacto y sin márgenes */
  @page {
    size: 58mm auto;
    margin: 0;
  }

  /* 2. Ajustes generales de impresión */
  @media print {
    html, body {
      width: 54mm;           /* deja 1 mm de margen a cada lado */
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      transform: scale(0.90);        /* opcional: encoge un 5% */
      transform-origin: top left;
    }
  }

  /* 3. Estilos de cuerpo */
  body {
    font-family: monospace;
    font-size: 12px;
    width: 52mm;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    text-align: center;
  }

  h2 {
    margin: 5px 0;
    font-size: 14px;
  }

  .logo {
    width: 80px;
    margin-bottom: 5px;
  }

  hr {
    border: none;
    border-top: 1px dashed #000;
    margin: 5px 0;
  }

  .item {
    display: flex;
    justify-content: space-between;
    margin: 2px 0;
  }

  .total {
    font-weight: bold;
    font-size: 14px;
  }

  .footer {
    font-size: 10px;
    margin-top: 8px;
  }
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
              (p) => `
            <div class="item">
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
            metodo === "Mercado Pago"
              ? `
            <div class="item"><span>Pagó:</span><span>$${parseFloat(
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
    if (ventana) {
      ventana.document.write(html);
    }
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
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-700">
            Cobro en efectivo
          </h2>
          <p className="text-center text-lg text-gray-600">
            Total:{" "}
            <span className="font-bold text-black">${total.toFixed(1)}</span>
          </p>
          <input
            type="number"
            placeholder="¿Con cuánto paga?"
            className="w-full p-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            value={montoPagado}
            onChange={(e) => setMontoPagado(e.target.value)}
          />
          <p className="text-center text-lg text-gray-600">
            Vuelto: <span className="font-bold text-green-600">${vuelto}</span>
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={confirmarPago}
              className="py-3 w-full rounded-xl bg-green-500 hover:bg-green-600 text-white text-lg font-semibold shadow-md transition"
            >
              Confirmar e imprimir
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

  if (paso === "qr") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div className="bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-700">
            Pagar con Mercado Pago
          </h2>
          {urlPago ? (
            <>
              <div className="flex justify-center mb-4">
                <QRCode value={urlPago} size={200} />
              </div>
              <a
                href={urlPago}
                target="_blank"
                className="block w-full text-center py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold shadow-md transition"
              >
                Ir al pago
              </a>
            </>
          ) : (
            <p className="text-center text-gray-500 text-lg animate-pulse">
              Generando QR...
            </p>
          )}
          <button
            onClick={onClose}
            className="py-3 w-full rounded-xl bg-gray-400 hover:bg-gray-500 text-black text-lg font-semibold transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }
}

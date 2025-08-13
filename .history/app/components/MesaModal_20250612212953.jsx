"use client";

import { useEffect, useState } from "react";
import useProductos from "../hooks/useProductos";
import {
  FaTrash,
  FaUser,
  FaMoneyBillWave,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import jsPDF from "jspdf";

import Swal from "sweetalert2";
import Resumen from "./Resumen";
import CobrarCuentaModal from "../cobrarCuenta/component/CobrarCuentaModal";
import SelectorProductos from "../components/ui/SelectorProductos";

async function loadImageAsBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function ModalMesa({ mesa, onClose, refetch }) {
  const { productos } = useProductos();
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarCobro, setMostrarCobro] = useState(false);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [pedidoActual, setPedidoActual] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [metodoPago, setMetodoPago] = useState("");

  useEffect(() => {
    if (mesa.estado === "ocupado") {
      setHistorial(mesa.productos || []);
      setMetodoPago(mesa.metodoPago || "");
    }
  }, [mesa]);

  const imprimirTicket = (orden, hora, fecha) => {
    const nuevaVentana = window.open("", "Ticket", "width=400,height=600");
    const comidas = pedidoActual.filter((p) => p.tipo !== "bebida");
    const bebidas = pedidoActual.filter((p) => p.tipo === "bebida");

    const html = `
      <html>
        <head>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              width: 320px; /* unos 72mm aprox en pantalla */
              margin: 0;
              padding: 5px;
              font-family: monospace;
              font-size: 11px;
              text-align: center;
            }
            h2 {
              margin: 5px 0;
              font-size: 14px;
            }
            img.logo {
              width: 80px;
              margin-bottom: 5px;
              filter: grayscale(100%);
            }
            hr {
              border: none;
              border-top: 1px dashed #000;
              margin: 6px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .qr {
              width: 80px;
              margin-top: 6px;
            }
            .small {
              font-size: 8px;
              margin-top: 4px;
            }
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
          <p><strong>Comidas:</strong></p>
          ${comidas
            .map(
              (p) => `
              <div class="item">
                <span>${p.cantidad}x ${p.nombre}</span>
         
              </div>
          `
            )
            .join("")}
          <p><strong>Bebidas:</strong></p>
          ${bebidas
            .map(
              (p) => `
              <div class="item">
                <span>${p.cantidad}x ${p.nombre}</span>
                
              </div>
          `
            )
            .join("")}
          <hr />
          <div class="item">
           
          </div>
          <hr />
        
  
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 300);
            };
          </script>
        </body>
      </html>
    `;

    nuevaVentana.document.write(html);
    nuevaVentana.document.close();
  };

  const enviarPedido = async () => {
    if (!pedidoActual.length) {
      Swal.fire({
        icon: "warning",
        title: "Sin productos",
        text: "Agrega productos antes de enviar el pedido.",
      });
      return;
    }

    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fecha = new Date().toLocaleDateString("es-AR");
    const orden = Date.now();
    const productosTotales = [...historial, ...pedidoActual];
    const total = productosTotales.reduce(
      (acc, p) =>
        acc + (p.precio * p.cantidad - (p.descuento || 0) * p.cantidad),
      0
    );

    try {
      const res = await fetch("http://localhost:5000/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa: mesa.numero,
          productos: productosTotales,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "Impresión OK",
          text: `Se imprimió en: ${data.impresos.join(", ")}`,
          timer: 3000,
        });

        // ✅ Cargar el logo
        const logoBase64 = await loadImageAsBase64("/Assets/logo-oficial.png");

        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [80, 150],
        });

        // ✅ Agregar imagen al PDF
        doc.addImage(logoBase64, "PNG", 25, 5, 30, 20); // Ajustá el tamaño si querés

        doc.setFont("courier", "normal");
        doc.setFontSize(12);
        doc.text("Perú Mar", 40, 30, { align: "center" });
        doc.setFontSize(10);
        doc.text(`Mesa: ${mesa.numero}`, 40, 36, { align: "center" });
        doc.text(`Orden #: ${orden}`, 40, 42, { align: "center" });
        doc.text(`Hora: ${hora}`, 40, 48, { align: "center" });
        doc.text(`Fecha: ${fecha}`, 40, 54, { align: "center" });
        doc.text("--------------------------------------------------", 40, 60, {
          align: "center",
        });

        doc.text("Comidas:", 10, 66);
        let y = 71;
        productosTotales
          .filter((p) => p.tipo !== "bebida")
          .forEach((p) => {
            doc.text(`${p.cantidad}x ${p.nombre}`, 10, y);
            y += 5;
          });

        doc.text("Bebidas:", 10, y + 5);
        y += 10;
        productosTotales
          .filter((p) => p.tipo === "bebida")
          .forEach((p) => {
            doc.text(`${p.cantidad}x ${p.nombre}`, 10, y);
            y += 5;
          });

        doc.text(
          "--------------------------------------------------",
          40,
          y + 5,
          { align: "center" }
        );

        doc.save(`Ticket-Mesa-${mesa.numero}-${orden}.pdf`);
      }

      await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: mesa.codigo,
          numero: mesa.numero,
          productos: productosTotales,
          metodoPago,
          total,
          estado: "ocupado",
          hora,
          fecha,
        }),
      });

      setHistorial(productosTotales);
      setPedidoActual([]);
      refetch?.();
    } catch (err) {
      console.error("Error al imprimir o guardar:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar el pedido.",
      });
    }
  };

  const eliminarComanda = async () => {
    const confirmar = confirm(
      "¿Seguro que querés liberar la mesa sin comanda?"
    );
    if (!confirmar) return;

    try {
      await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: mesa.codigo,
          numero: mesa.numero,
          productos: [],
          metodoPago: "",
          total: 0,
          estado: "libre",
          hora: "",
          fecha: "",
        }),
      });

      refetch?.();
      onClose();
    } catch (err) {
      console.error("Error al liberar mesa:", err);
      alert("No se pudo liberar la mesa.");
    }
  };

  const todosLosProductos = [...historial, ...pedidoActual];
  const subtotal = todosLosProductos.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );
  const descuento = todosLosProductos.reduce(
    (acc, p) => acc + (p.descuento || 0) * p.cantidad,
    0
  );
  const iva = (subtotal - descuento) * 0.18;
  const total = subtotal - descuento + iva;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-5xl rounded-2xl p-6 shadow-2xl text-white max-h-screen overflow-y-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-orange-400">
            🍽️ Mesa {mesa.numero}
          </h2>
          <button
            onClick={() => {
              refetch?.();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700 p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-semibold">
          <button
            onClick={enviarPedido}
            className="bg-green-500 hover:bg-green-600 py-2 rounded-xl w-full"
          >
            <FaPlus className="inline mr-1" /> Enviar Pedido
          </button>

          <button
            onClick={() => setMostrarCobro(true)}
            className="bg-blue-500 hover:bg-blue-600 py-2 rounded-xl w-full"
          >
            💰 Cobrar Cuenta
          </button>

          <button
            onClick={eliminarComanda}
            className="bg-red-600 hover:bg-red-700 py-2 rounded-xl w-full"
          >
            <FaTrash className="inline mr-2" /> Liberar Mesa
          </button>
        </div>

        <button
          onClick={() => setMostrarSelector(true)}
          className="w-full bg-orange-600 hover:bg-orange-700 py-2 rounded-xl font-semibold"
        >
          ➕ Añadir producto
        </button>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs">
            <thead className="bg-white/10 text-white/80">
              <tr>
                <th className="p-2 text-left">Descripción</th>
                <th className="p-2">Cant.</th>
                <th className="p-2">Precio</th>
                <th className="p-2">Desc.</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {todosLosProductos.map((p, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="p-2">
                    {p.nombre}
                    {p.adicionales?.length > 0 && (
                      <div className="text-[10px] text-gray-400">
                        + {p.adicionales.join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="text-center">{p.cantidad}</td>
                  <td className="text-center">${p.precio}</td>
                  <td className="text-center">${p.descuento || 0}</td>
                  <td className="text-center font-semibold">
                    $
                    {(
                      p.precio * p.cantidad -
                      (p.descuento || 0) * p.cantidad
                    ).toFixed(2)}
                  </td>
                  <td className="text-center">
                    <button
                      className="text-red-500 hover:text-red-700 text-sm"
                      onClick={() => {
                        const nuevos = todosLosProductos.filter(
                          (_, index) => index !== i
                        );
                        const nuevosHistorial =
                          i < historial.length
                            ? nuevos.slice(0, historial.length - 1)
                            : historial;
                        const nuevosActual =
                          i >= historial.length
                            ? nuevos.slice(historial.length)
                            : pedidoActual;
                        setHistorial(nuevosHistorial);
                        setPedidoActual(nuevosActual);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-right text-sm space-y-1">
          <p>
            Subtotal:{" "}
            <span className="text-white/80">${subtotal.toFixed(2)}</span>
          </p>
          <p>
            Descuento:{" "}
            <span className="text-white/80">-${descuento.toFixed(2)}</span>
          </p>

          <p className="text-cyan-400 font-bold text-lg mt-2">
            Total: ${subtotal.toFixed(2)}
          </p>
        </div>

        {mostrarPago && (
          <div className="mt-6">
            <label className="text-sm font-medium flex items-center gap-1">
              <FaMoneyBillWave /> Método de pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-white/20 rounded-xl bg-white/10 text-white"
            >
              <option value="">Selecciona</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
        )}

        {mostrarResumen && (
          <Resumen mesa={mesa} onClose={() => setMostrarResumen(false)} />
        )}
        {mostrarCobro && (
          <CobrarCuentaModal
            onClose={() => setMostrarCobro(false)}
            mesa={mesa}
            productos={todosLosProductos}
            total={total}
            refetch={refetch}
          />
        )}
        {mostrarSelector && (
          <SelectorProductos
            productos={productos}
            onSelect={(producto) => {
              const nuevo = {
                ...producto,
                descuento: producto.descuento || 0,
                adicionales: [],
              };

              const existente = pedidoActual.find(
                (p) => p.nombre === nuevo.nombre
              );
              if (existente) {
                setPedidoActual(
                  pedidoActual.map((p) =>
                    p.nombre === nuevo.nombre
                      ? { ...p, cantidad: p.cantidad + producto.cantidad }
                      : p
                  )
                );
              } else {
                setPedidoActual([...pedidoActual, nuevo]);
              }
            }}
            onClose={() => setMostrarSelector(false)}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import useProductos from "@/app/hooks/useProductos";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";

export default function RestauranteForm() {
  const { productos } = useProductos();

  const [nombre, setNombre] = useState("");
  const [comida, setComida] = useState("");
  const [bebida, setBebida] = useState("");
  const [presupuesto, setPresupuesto] = useState([]);
  const [pago, setPago] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [urlPago, setUrlPago] = useState("");

  const comidas = productos.filter((p) => p.tipo !== "bebida");
  const bebidas = productos.filter((p) => p.tipo === "bebida");

  const agregarComida = () => {
    if (!comida) return;
    setPresupuesto((prev) => [...prev, { comida, bebida: "" }]);
    setComida("");
  };

  const agregarBebida = () => {
    if (!bebida) return;
    setPresupuesto((prev) => [...prev, { comida: "", bebida }]);
    setBebida("");
  };

  const eliminarItem = (index) => {
    setPresupuesto((prev) => prev.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return presupuesto.reduce((total, item) => {
      const comidaProd = productos.find((p) => p.nombre === item.comida);
      const bebidaProd = productos.find((p) => p.nombre === item.bebida);
      const base = comidaProd?.precio || 0;
      const bebidaPrecio = bebidaProd?.precio || 0;
      return total + base + bebidaPrecio;
    }, 0);
  };

  const total = calcularTotal();

  const generarPagoMP = async () => {
    const res = await fetch("/api/mercado-pago/crear-pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        total,
        mesa: nombre || "MOSTRADOR",
        nombreCliente: nombre || "Cliente",
      }),
    });

    const data = await res.json();
    setUrlPago(data.init_point);
    setExternalReference(data.external_reference);

    if (pago === "link") {
      window.open(data.init_point, "_blank");
    } else if (pago === "qr") {
      const QRCode = await import("qrcode");

      Swal.fire({
        title: "Escanea el QR",
        html: `<div id="qrcode"></div><p style="margin-top:10px;"><a href="${data.init_point}" target="_blank">Abrir en nueva pestaña</a></p>`,
        didOpen: () => {
          const container = document.getElementById("qrcode");
          QRCode.toCanvas(data.init_point, { width: 200 }, (err, canvas) => {
            if (err) {
              console.error("Error generando QR:", err);
              container.innerHTML = "<p>Error generando QR</p>";
              return;
            }
            container.appendChild(canvas);
          });
        },
        showConfirmButton: false,
        allowOutsideClick: false,
      });
    }

    esperarConfirmacionPago();
  };

  const esperarConfirmacionPago = () => {
    let intentos = 0;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/mercado-pago/estado/${externalReference}`);
      const data = await res.json();

      if (data.status === "approved") {
        clearInterval(interval);
        Swal.close();
        imprimirDelivery();
        enviarPedidoFinal();
      }

      intentos++;
      if (intentos >= 24) {
        clearInterval(interval);
        Swal.fire("Pago no confirmado", "Intenta nuevamente.", "error");
      }
    }, 5000);
  };

  const imprimirDelivery = async (productos, nombre, hora, fecha, pago) => {
    try {
      await fetch("/api/printdelivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa: nombre || "MOSTRADOR",
          productos,
          orden: Date.now(),
          hora,
          fecha,
          metodoPago: pago,
        }),
      });
    } catch (err) {
      console.error("Error imprimiendo:", err);
    }
  };

  const enviarPedido = async () => {
    if (!nombre || presupuesto.length === 0 || !pago) {
      alert("Por favor completa todos los campos.");
      return;
    }

    if (pago === "efectivo") {
      enviarPedidoFinal();
    } else {
      await generarPagoMP();
    }
  };

  const enviarPedidoFinal = async () => {
    const now = new Date();
    const hora = now.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fecha = now.toLocaleDateString("es-AR");

    const payload = {
      modoPedido: "restaurante",
      tipo: "entregalocal",
      nombre,
      formaDePago: pago,
      comidas: presupuesto,
      total,
      estado: "en curso",
      fecha: now.toLocaleString("es-AR"),
      timestamp: now,
    };

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const productosParaImprimir = presupuesto.map((item) => ({
          nombre: item.comida || item.bebida,
          cantidad: 1,
        }));

        await imprimirDelivery(
          productosParaImprimir,
          nombre,
          hora,
          fecha,
          pago
        );

        Swal.fire("Pedido enviado correctamente", "", "success");
        resetFormulario();
      } else {
        Swal.fire("Error", "No se pudo enviar el pedido", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "Hubo un problema al enviar", "error");
    }
  };

  const resetFormulario = () => {
    setNombre("");
    setComida("");
    setBebida("");
    setPresupuesto([]);
    setPago("");
    setExternalReference("");
    setUrlPago("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20 placeholder-gray-300"
          placeholder="Nombre del cliente"
        />
        <select
          value={comida}
          onChange={(e) => setComida(e.target.value)}
          className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20"
        >
          <option className="text-black" value="">
            Selecciona una comida
          </option>
          {comidas.map((p) => (
            <option className="text-black" key={p._id} value={p.nombre}>
              {p.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={agregarComida}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl mb-6"
        >
          <div className="flex items-center justify-center gap-2">
            <FiPlusCircle /> Agregar comida
          </div>
        </button>
        <select
          value={bebida}
          onChange={(e) => setBebida(e.target.value)}
          className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20"
        >
          <option className="text-black" value="">
            Selecciona una bebida
          </option>
          {bebidas.map((p) => (
            <option className="text-black" key={p._id} value={p.nombre}>
              {p.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={agregarBebida}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl"
        >
          <div className="flex items-center justify-center gap-2">
            <FiPlusCircle /> Agregar bebida
          </div>
        </button>
        {presupuesto.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              Resumen:
            </h3>
            <ul className="space-y-2 text-sm text-gray-200">
              {presupuesto.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{item.comida || item.bebida}</span>
                  <button
                    onClick={() => eliminarItem(index)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <select
          value={pago}
          onChange={(e) => setPago(e.target.value)}
          className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20"
        >
          <option className="text-black" value="">
            Forma de pago
          </option>
          <option className="text-black" value="efectivo">
            Efectivo
          </option>
          <option className="text-black" value="qr">
            Mercado Pago QR
          </option>
          <option className="text-black" value="link">
            Link de pago
          </option>
        </select>

        {(pago === "link" || pago === "qr") && urlPago && (
          <a
            href={urlPago}
            target="_blank"
            className="block text-center mt-2 text-blue-300 underline"
          >
            Ir al link/QR de pago
          </a>
        )}

        <p className="text-right text-lg font-bold text-cyan-300 mb-4">
          Total: ${total.toFixed(2)}
        </p>

        <button
          onClick={enviarPedido}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl"
        >
          Hacer Pedido
        </button>
      </div>
    </div>
  );
}

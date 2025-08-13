"use client";

import { useState, useEffect } from "react";
import useProductos from "@/app/hooks/useProductos";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";

export default function DeliveryForm() {
  const { productos } = useProductos();

  const [nombre, setNombre] = useState("");
  const [comida, setComida] = useState("");
  const [bebida, setBebida] = useState("");
  const [direccion, setDireccion] = useState("");
  const [observacion, setObservacion] = useState("");
  const [pago, setPago] = useState("");
  const [adicionalesDisponibles, setAdicionalesDisponibles] = useState([]);
  const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState([]);
  const [presupuesto, setPresupuesto] = useState([]);

  const comidas = productos.filter((p) => p.tipo !== "bebida");
  const bebidas = productos.filter((p) => p.tipo === "bebida");

  useEffect(() => {
    const seleccionado = productos.find((p) => p.nombre === comida);
    setAdicionalesDisponibles(seleccionado?.adicionales || []);
    setAdicionalesSeleccionados([]);
  }, [comida]);

  const agregarComida = () => {
    if (!comida) return;
    setPresupuesto((prev) => [
      ...prev,
      { comida, bebida: "", adicionales: [...adicionalesSeleccionados] },
    ]);
    setComida("");
    setAdicionalesSeleccionados([]);
    setAdicionalesDisponibles([]);
  };

  const agregarBebida = () => {
    if (!bebida) return;
    setPresupuesto((prev) => [
      ...prev,
      { comida: "", bebida, adicionales: [] },
    ]);
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
      const adic = (item.adicionales?.length || 0) * 200;
      return total + base + adic + bebidaPrecio;
    }, 0);
  };

  const total = calcularTotal();

  const enviarPedido = async () => {
    if (!nombre || presupuesto.length === 0 || !direccion || !pago) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const now = new Date();
    const payload = {
      modoPedido: "delivery",
      nombre,
      direccion,
      observacion,
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
        imprimirTicket();
        alert("Pedido enviado correctamente.");
        resetFormulario();
      } else {
        alert("Error al enviar el pedido.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar el pedido.");
    }
  };

  const resetFormulario = () => {
    setNombre("");
    setComida("");
    setBebida("");
    setDireccion("");
    setObservacion("");
    setPago("");
    setAdicionalesSeleccionados([]);
    setPresupuesto([]);
  };

  // Ticket optimizado OCPP-80S
  const imprimirTicket = () => {
    const fechaHora = new Date().toLocaleString("es-AR");

    let ticket = `
      <html>
      <head>
        <style>
          @page { size: 80mm auto; margin: 5mm; }
          body { font-family: monospace; font-size: 11px; }
          h2 { text-align: center; margin: 5px 0; }
          .item { display: flex; justify-content: space-between; }
          .total { border-top: 1px dashed #000; margin-top: 5px; padding-top: 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>PERÚ MAR</h2>
        <p>Delivery - Pedido</p>
        <p>Cliente: ${nombre}</p>
        <p>Fecha: ${fechaHora}</p>
        <hr>
    `;

    presupuesto.forEach((item) => {
      if (item.comida) {
        ticket += `<div class="item"><span>${item.comida}</span></div>`;
        if (item.adicionales.length > 0) {
          ticket += `<div style="margin-left:10px;">+ ${item.adicionales.join(
            ", "
          )}</div>`;
        }
      }
      if (item.bebida) {
        ticket += `<div class="item"><span>${item.bebida}</span></div>`;
      }
    });

    ticket += `
      <div class="total">TOTAL: $${total.toFixed(2)}</div>
      <hr>
      <p>¡Gracias por su compra!</p>
      <script>window.onload = function() { window.print(); setTimeout(() => window.close(), 300); }</script>
      </body></html>`;

    const nuevaVentana = window.open("", "PRINT", "width=400,height=600");
    nuevaVentana.document.write(ticket);
    nuevaVentana.document.close();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        {/* Formulario principal */}
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input"
          placeholder="Nombre cliente"
        />

        <select
          value={comida}
          onChange={(e) => setComida(e.target.value)}
          className="input"
        >
          <option value="">Selecciona comida</option>
          {comidas.map((p) => (
            <option key={p._id} value={p.nombre}>
              {p.nombre}
            </option>
          ))}
        </select>

        {adicionalesDisponibles.length > 0 && (
          <div>
            <p className="text-sm text-gray-300">Adicionales:</p>
            {adicionalesDisponibles.map((ad, i) => (
              <label
                key={i}
                className="flex items-center gap-2 text-sm text-gray-200"
              >
                <input
                  type="checkbox"
                  value={ad}
                  checked={adicionalesSeleccionados.includes(ad)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAdicionalesSeleccionados((prev) =>
                      checked
                        ? [...prev, ad]
                        : prev.filter((item) => item !== ad)
                    );
                  }}
                />
                {ad}
              </label>
            ))}
          </div>
        )}

        <button onClick={agregarComida} className="btn-orange">
          <FiPlusCircle /> Agregar comida
        </button>

        <select
          value={bebida}
          onChange={(e) => setBebida(e.target.value)}
          className="input"
        >
          <option value="">Selecciona bebida</option>
          {bebidas.map((p) => (
            <option key={p._id} value={p.nombre}>
              {p.nombre}
            </option>
          ))}
        </select>

        <button onClick={agregarBebida} className="btn-blue">
          <FiPlusCircle /> Agregar bebida
        </button>

        {/* Resumen */}
        {presupuesto.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              Resumen:
            </h3>
            <ul className="space-y-2 text-sm text-gray-200">
              {presupuesto.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>
                    {item.comida || item.bebida}{" "}
                    {item.adicionales.length > 0 &&
                      `+ ${item.adicionales.join(", ")}`}
                  </span>
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

      {/* Segunda columna */}
      <div>
        <input
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          className="input"
          placeholder="Dirección"
        />
        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          className="input"
          placeholder="Observaciones"
          rows={4}
        />
        <select
          value={pago}
          onChange={(e) => setPago(e.target.value)}
          className="input"
        >
          <option value="">Forma de pago</option>
          <option value="efectivo">Efectivo</option>
          <option value="mercado pago">Mercado Pago</option>
        </select>

        <p className="text-right text-lg font-bold text-cyan-300 mb-4">
          Total: ${total.toFixed(2)}
        </p>
        <button
          onClick={enviarPedido}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition"
        >
          Hacer Pedido
        </button>
      </div>
    </div>
  );
}

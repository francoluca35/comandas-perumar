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
  const [tipoPedido, setTipoPedido] = useState("delivery"); // <-- Nuevo estado

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

  const imprimirTicket = () => {
    let ticket = "";

    ticket += "     📦 Pedido\n";
    ticket += "------------------------------\n";
    ticket += `Tipo: ${tipoPedido.toUpperCase()}\n`;
    ticket += `Cliente: ${nombre}\n`;
    ticket += `Observación: ${observacion || "Ninguna"}\n`;
    ticket += "------------------------------\n";

    presupuesto.forEach((item) => {
      if (item.comida) {
        ticket += `🍽 ${item.comida}\n`;
        if (item.adicionales?.length > 0) {
          ticket += `  + ${item.adicionales.join(", ")}\n`;
        }
      }
      if (item.bebida) {
        ticket += `🥤 ${item.bebida}\n`;
      }
    });

    ticket += "------------------------------\n";

    const html = `
      <html>
        <head>
          <style>
            body { font-family: monospace; font-size: 13px; margin: 0; padding: 0; }
            pre { margin: 0; padding: 10px; }
          </style>
        </head>
        <body>
          <pre>${ticket}</pre>
          <script>
            window.onload = function() { window.print(); setTimeout(()=>window.close(), 300); }
          </script>
        </body>
      </html>
    `;

    const nuevaVentana = window.open("", "Ticket", "width=380,height=600");
    nuevaVentana.document.write(html);
    nuevaVentana.document.close();
  };

  const enviarPedido = async () => {
    if (!nombre || presupuesto.length === 0 || !direccion || !pago) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const now = new Date();
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      direccion
    )}`;

    const payload = {
      modoPedido: tipoPedido, // <-- Este es el cambio principal
      nombre,
      direccion,
      mapsLink,
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
        alert("Pedido enviado correctamente.");
        imprimirTicket();
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
    setPresupuesto([]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Selección de tipo */}
      <div className="mb-4 md:col-span-2">
        <label className="block mb-2 text-white font-semibold">
          Tipo de pedido:
        </label>
        <select
          value={tipoPedido}
          onChange={(e) => setTipoPedido(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20"
        >
          <option value="delivery">Delivery</option>
          <option value="retiro">Para llevar</option>
        </select>
      </div>

      <div>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input"
          placeholder="Nombre cliente"
        />

        {/* resto igual como ya lo tenías */}
        {/* ... */}

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

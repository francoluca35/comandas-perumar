"use client";

import { useState, useEffect } from "react";
import useProductos from "../hooks/useProductos";

export default function Pedidos() {
  const { productos } = useProductos();

  const [nombre, setNombre] = useState("");
  const [comida, setComida] = useState("");
  const [direccion, setDireccion] = useState("");
  const [observacion, setObservacion] = useState("");
  const [pago, setPago] = useState("");

  const enviarPedido = async () => {
    if (!nombre || !comida || !direccion || !pago) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const payload = {
      nombre,
      comida,
      direccion,
      observacion,
      formaDePago: pago,
      estado: "en curso",
      fecha: new Date().toLocaleString("es-AR"),
    };

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Pedido enviado correctamente.");
        setNombre("");
        setComida("");
        setDireccion("");
        setObservacion("");
        setPago("");
      } else {
        alert("Error al enviar el pedido.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar el pedido.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-orange-500 mb-6 text-center">
        pedidos
      </h2>

      <label className="block mb-2 text-sm">Nombre del cliente</label>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-200 text-black rounded"
      />

      <label className="block mb-2 text-sm">Comida</label>
      <select
        value={comida}
        onChange={(e) => setComida(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-200 text-black rounded"
      >
        <option value="">Selecciona una comida</option>
        {productos.map((p) => (
          <option key={p._id} value={p.nombre}>
            {p.nombre}
          </option>
        ))}
      </select>

      <label className="block mb-2 text-sm">Dirección</label>
      <input
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-200 text-black rounded"
        placeholder="Ej:Brasil 3421, Merlo, Buenos Aires"
      />

      <label className="block mb-2 text-sm">Observación</label>
      <textarea
        value={observacion}
        onChange={(e) => setObservacion(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-200 text-black rounded"
        rows={3}
      />

      <label className="block mb-2 text-sm">Forma de pago</label>
      <select
        value={pago}
        onChange={(e) => setPago(e.target.value)}
        className="w-full p-2 mb-6 bg-gray-200 text-black rounded"
      >
        <option value="">Selecciona</option>
        <option value="efectivo">Efectivo</option>
        <option value="mercado pago">Mercado Pago</option>
      </select>

      <button
        onClick={enviarPedido}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded"
      >
        Pagar
      </button>
    </div>
  );
}

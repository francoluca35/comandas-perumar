"use client";

import { useState, useEffect } from "react";
import useProductos from "@/app/hooks/useProductos";

export default function RestauranteForm() {
  const { productos } = useProductos();

  const [nombre, setNombre] = useState("");
  const [comida, setComida] = useState("");
  const [bebida, setBebida] = useState("");
  const [pago, setPago] = useState("");

  const comidas = productos.filter((p) => p.tipo !== "bebida");
  const bebidas = productos.filter((p) => p.tipo === "bebida");

  const calcularTotal = () => {
    const comidaProd = productos.find((p) => p.nombre === comida);
    const bebidaProd = productos.find((p) => p.nombre === bebida);
    const base = comidaProd?.precio || 0;
    const bebidaPrecio = bebidaProd?.precio || 0;
    return base + bebidaPrecio;
  };

  const enviarPedido = async () => {
    if (!nombre || (!comida && !bebida) || !pago) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const now = new Date();

    const payload = {
      modoPedido: "restaurante",
      nombre,
      formaDePago: pago,
      comidas: [{ comida, bebida }],
      total: calcularTotal(),
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
        setNombre("");
        setComida("");
        setBebida("");
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
    <div className="space-y-4">
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-gray-300 focus:outline-none"
        placeholder="Nombre del cliente"
      />

      <select
        value={comida}
        onChange={(e) => setComida(e.target.value)}
        className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-gray-300 focus:outline-none"
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

      <select
        value={bebida}
        onChange={(e) => setBebida(e.target.value)}
        className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-gray-300 focus:outline-none"
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

      <select
        value={pago}
        onChange={(e) => setPago(e.target.value)}
        className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none"
      >
        <option className="text-black" value="">
          Forma de pago
        </option>
        <option className="text-black" value="efectivo">
          Efectivo
        </option>
        <option className="text-black" value="mercado pago">
          Mercado Pago
        </option>
      </select>

      <p className="text-right text-lg font-bold text-cyan-300">
        Total: ${calcularTotal().toFixed(2)}
      </p>

      <button
        onClick={enviarPedido}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition"
      >
        Hacer Pedido
      </button>
    </div>
  );
}

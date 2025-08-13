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
  const [adicionalesDisponibles, setAdicionalesDisponibles] = useState([]);
  const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState([]);
  const [presupuesto, setPresupuesto] = useState([]);

  useEffect(() => {
    const seleccionado = productos.find((p) => p.nombre === comida);
    setAdicionalesDisponibles(seleccionado?.adicionales || []);
    setAdicionalesSeleccionados([]);
  }, [comida]);

  const agregarAlPresupuesto = () => {
    if (!comida) return;

    setPresupuesto((prev) => [
      ...prev,
      {
        comida,
        adicionales: [...adicionalesSeleccionados],
      },
    ]);

    setComida("");
    setAdicionalesSeleccionados([]);
    setAdicionalesDisponibles([]);
  };

  const calcularTotal = () => {
    return presupuesto.reduce((total, item) => {
      const prod = productos.find((p) => p.nombre === item.comida);
      const base = prod?.precio || 0;
      const adic = (item.adicionales?.length || 0) * 200;
      return total + base + adic;
    }, 0);
  };

  const total = calcularTotal();

  const enviarPedido = async () => {
    if (!nombre || presupuesto.length === 0 || !direccion || !pago) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const payload = {
      nombre,
      direccion,
      observacion,
      formaDePago: pago,
      comidas: presupuesto,
      total,
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
        setAdicionalesSeleccionados([]);
        setPresupuesto([]);
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

      {adicionalesDisponibles.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2 text-sm">Adicionales</label>
          <div className="flex flex-wrap gap-3">
            {adicionalesDisponibles.map((ad, i) => (
              <label key={i} className="flex items-center text-sm gap-2">
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
        </div>
      )}

      <button
        onClick={agregarAlPresupuesto}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded mb-6"
      >
        Agregar al presupuesto
      </button>

      {presupuesto.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Resumen:</h3>
          <ul className="list-disc list-inside text-sm">
            {presupuesto.map((item, index) => (
              <li key={index}>
                {item.comida}
                {item.adicionales?.length > 0 && (
                  <> + {item.adicionales.join(", ")}</>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

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

      <p className="text-right text-lg font-bold text-orange-400 mb-4">
        Total: ${total.toFixed(2)}
      </p>

      <button
        onClick={enviarPedido}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded"
      >
        Pagar
      </button>
    </div>
  );
}

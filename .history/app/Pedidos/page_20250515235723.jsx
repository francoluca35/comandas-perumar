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

    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      direccion
    )}`;

    const payload = {
      nombre,
      direccion,
      mapsLink,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 max-w-3xl mx-auto w-full">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-full">
        <h2 className="text-3xl font-bold text-orange-500 mb-8 text-center uppercase">
          Nuevo Pedido
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 text-sm">Nombre del cliente</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-200 text-black rounded-lg"
            />

            <label className="block mb-1 text-sm">Comida</label>
            <select
              value={comida}
              onChange={(e) => setComida(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-200 text-black rounded-lg"
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
                <label className="block mb-1 text-sm">Adicionales</label>
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
              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-orange-400">Resumen:</h3>
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
          </div>

          <div>
            <label className="block mb-1 text-sm">Dirección</label>
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-200 text-black rounded-lg"
              placeholder="Ej: Brasil 3421, Merlo, Buenos Aires"
            />

            <label className="block mb-1 text-sm">Observación</label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-200 text-black rounded-lg"
              rows={4}
            />

            <label className="block mb-1 text-sm">Forma de pago</label>
            <select
              value={pago}
              onChange={(e) => setPago(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-200 text-black rounded-lg"
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
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded"
            >
              Pagar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

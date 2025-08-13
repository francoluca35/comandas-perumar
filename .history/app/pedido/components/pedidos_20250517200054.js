"use client";

import { useState, useEffect } from "react";
import useProductos from "@/app/hooks/useProductos";
import BackArrow from "@/app/components/ui/BackArrow";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";

export default function Pedidos() {
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
      {
        comida,
        bebida: "",
        adicionales: [...adicionalesSeleccionados],
      },
    ]);

    setComida("");
    setAdicionalesSeleccionados([]);
    setAdicionalesDisponibles([]);
  };

  const agregarBebida = () => {
    if (!bebida) return;

    setPresupuesto((prev) => [
      ...prev,
      {
        comida: "",
        bebida,
        adicionales: [],
      },
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
        setBebida("");
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-black text-white px-4 py-12 flex items-center justify-center">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl p-8">
        <div className="mb-6">
          <BackArrow label="Volver al panel" />
        </div>

        <h2 className="text-4xl font-bold text-white mb-8 text-center">
          🍽 Nuevo Pedido
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20 placeholder-gray-300 focus:outline-none"
              placeholder="Nombre del cliente"
            />

            <select
              value={comida}
              onChange={(e) => setComida(e.target.value)}
              className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20 placeholder-gray-300 focus:outline-none"
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

            {adicionalesDisponibles.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm text-gray-300">Adicionales:</p>
                <div className="flex flex-wrap gap-3">
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
              </div>
            )}

            <button
              onClick={agregarComida}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition mb-6"
            >
              <div className="flex items-center justify-center gap-2">
                <FiPlusCircle /> Agregar comida
              </div>
            </button>

            <select
              value={bebida}
              onChange={(e) => setBebida(e.target.value)}
              className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none"
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
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition"
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
                    <li
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span>
                        {item.comida && <>{item.comida}</>}
                        {item.adicionales?.length > 0 && (
                          <> + {item.adicionales.join(", ")}</>
                        )}
                        {item.bebida && <>{item.bebida}</>}
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

          <div>
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20 placeholder-gray-300 focus:outline-none"
              placeholder="Dirección (ej: Brasil 3421, Merlo)"
            />

            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20 placeholder-gray-300 focus:outline-none"
              rows={4}
              placeholder="Observaciones (opcional)"
            />

            <select
              value={pago}
              onChange={(e) => setPago(e.target.value)}
              className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none"
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

            <p className="text-right text-lg font-bold text-cyan-300 mb-4">
              Total: ${total.toFixed(2)}
            </p>

            <button
              onClick={enviarPedido}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition"
            >
              Pagar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import useProductos from "@/app/hooks/useProductos";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";
import QRCode from "react-qr-code";

export default function DeliveryForm() {
  const { productos } = useProductos();

  const [nombre, setNombre] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [direccion, setDireccion] = useState("");
  const [observacion, setObservacion] = useState("");
  const [pago, setPago] = useState("");
  const [urlPago, setUrlPago] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [adicionalesDisponibles, setAdicionalesDisponibles] = useState([]);
  const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState([]);
  const [presupuesto, setPresupuesto] = useState([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    const seleccionado = productos.find(
      (p) => p.nombre === productoSeleccionado
    );
    setAdicionalesDisponibles(seleccionado?.adicionales || []);
    setAdicionalesSeleccionados([]);
  }, [productoSeleccionado]);

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad < 1) return;
    const tipo = productos.find((p) => p.nombre === productoSeleccionado)?.tipo;
    setPresupuesto((prev) => [
      ...prev,
      {
        comida: tipo !== "bebida" ? productoSeleccionado : "",
        bebida: tipo === "bebida" ? productoSeleccionado : "",
        adicionales: [...adicionalesSeleccionados],
        cantidad,
      },
    ]);
    setProductoSeleccionado("");
    setCantidad(1);
    setAdicionalesSeleccionados([]);
    setAdicionalesDisponibles([]);
    setBusqueda("");
  };

  const eliminarItem = (index) => {
    setPresupuesto((prev) => prev.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return presupuesto.reduce((total, item) => {
      const comidaProd = productos.find((p) => p.nombre === item.comida);
      const bebidaProd = productos.find((p) => p.nombre === item.bebida);
      const base = (comidaProd?.precio || 0) * (item.cantidad || 1);
      const bebidaPrecio = (bebidaProd?.precio || 0) * (item.cantidad || 1);
      const adic = (item.adicionales?.length || 0) * 200;
      return total + base + adic + bebidaPrecio;
    }, 0);
  };

  const total = calcularTotal();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20"
          placeholder="Nombre del cliente"
        />

        <input
          type="text"
          placeholder="Buscar comida o bebida..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setMostrarDropdown(true);
          }}
          className="w-full px-4 py-3 mb-2 bg-white/10 text-white rounded-xl border border-white/20"
          onFocus={() => setMostrarDropdown(true)}
        />

        {mostrarDropdown && productosFiltrados.length > 0 && (
          <ul className="absolute z-10 w-full bg-white text-black rounded-xl shadow-md max-h-40 overflow-y-auto">
            {productosFiltrados.map((p) => (
              <li
                key={p._id}
                className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setProductoSeleccionado(p.nombre);
                  setBusqueda(p.nombre);
                  setMostrarDropdown(false);
                }}
              >
                {p.nombre}
              </li>
            ))}
          </ul>
        )}

        <input
          type="number"
          min={1}
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="w-full px-4 py-2 mb-2 bg-white/10 text-white rounded-xl border border-white/20"
        />

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
          onClick={agregarProducto}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl mb-6"
        >
          <div className="flex items-center justify-center gap-2">
            <FiPlusCircle /> Agregar producto
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
                  <span>
                    {item.cantidad}x {item.comida || item.bebida}
                    {item.adicionales?.length > 0 && (
                      <> + {item.adicionales.join(", ")}</>
                    )}
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
          className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20"
          placeholder="Dirección"
        />
        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          className="w-full px-4 py-3 mb-4 bg-white/10 text-white rounded-xl border border-white/20"
          rows={3}
          placeholder="Observación (opcional)"
        />
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
          <option className="text-black" value="link">
            Link de pago
          </option>
        </select>

        {pago === "link" && urlPago && (
          <div className="my-4 text-center">
            <QRCode value={urlPago} size={180} />
            <a
              href={urlPago}
              target="_blank"
              className="block text-blue-300 underline mt-2"
            >
              Pagar ahora con Mercado Pago
            </a>
          </div>
        )}

        <p className="text-right text-lg font-bold text-cyan-300 mb-4">
          Total: ${total.toFixed(2)}
        </p>

        {pago === "efectivo" && (
          <button
            onClick={() => alert("Pedido enviado")}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl"
          >
            Hacer Pedido
          </button>
        )}
      </div>
    </div>
  );
}

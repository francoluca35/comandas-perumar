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

  return (
    <div>
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
    </div>
  );
}

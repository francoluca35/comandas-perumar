"use client";

import { useState, useRef } from "react";
import useAgregarMenu from "@/app/hooks/useAgregarMenu";
import useProductos from "@/app/hooks/useProductos";
import { validarImagenMenu } from "@/utils/validationApp";
import BackArrow from "@/app/components/ui/BackArrow";
import Swal from "sweetalert2";
import { FiPlusCircle, FiX } from "react-icons/fi";

export default function AgregarMenu() {
  const { agregarMenu, loading } = useAgregarMenu();
  const { productos, refetch } = useProductos();
  const [modo, setModo] = useState("agregar");

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("comida");
  const [precio, setPrecio] = useState("");
  const [precioConIVA, setPrecioConIVA] = useState("");
  const [descuento, setDescuento] = useState("");
  const [adicional, setAdicional] = useState("");
  const [adicionales, setAdicionales] = useState([]);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleAgregar = async (e) => {
    e.preventDefault();

    const error = validarImagenMenu(file);
    if (error) {
      Swal.fire("Imagen no válida", error, "error");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("tipo", tipo);
    formData.append("precio", precio);
    formData.append("precioConIVA", precioConIVA);
    formData.append("descuento", descuento || "");
    formData.append(
      "adicionales",
      JSON.stringify(tipo === "comida" ? adicionales : [])
    );
    if (file) formData.append("file", file);

    await agregarMenu(formData);
    Swal.fire("Agregado", "Menú agregado correctamente.", "success");

    // Limpiar inputs
    setNombre("");
    setPrecio("");
    setPrecioConIVA("");
    setDescuento("");
    setAdicional("");
    setAdicionales([]);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    refetch?.();
  };

  const agregarAdicional = () => {
    if (adicional.trim()) {
      setAdicionales([...adicionales, adicional.trim()]);
      setAdicional("");
    }
  };

  const eliminarAdicional = (index) => {
    const nuevos = [...adicionales];
    nuevos.splice(index, 1);
    setAdicionales(nuevos);
  };

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 py-16 px-4">
      <div className="max-w-3xl mx-auto backdrop-blur-lg bg-white/5 rounded-3xl p-6 md:p-10 border border-gray-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-4 left-4">
          <BackArrow label="Volver al panel" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
          🍽 Gestión de Menú
        </h2>

        <div className="flex justify-center mb-8">
          <div className="bg-white/10 rounded-xl p-1 flex justify-center gap-2 w-full md:w-auto border border-white/20">
            <button
              onClick={() => setTipo("comida")}
              className={`px-4 py-2 rounded-xl transition ${
                tipo === "comida"
                  ? "bg-red-600 text-white font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              🍽 Comida
            </button>
            <button
              onClick={() => setTipo("bebida")}
              className={`px-4 py-2 rounded-xl transition ${
                tipo === "bebida"
                  ? "bg-blue-600 text-white font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              🥤 Bebida
            </button>
          </div>
        </div>

        <form
          onSubmit={handleAgregar}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6"
        >
          <input
            type="text"
            placeholder="Nombre del producto"
            className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Precio"
            className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Precio con IVA"
            className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
            value={precioConIVA}
            onChange={(e) => setPrecioConIVA(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Descuento (opcional)"
            className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
            value={descuento}
            onChange={(e) => setDescuento(e.target.value)}
          />

          {tipo === "comida" && (
            <>
              <div className="sm:col-span-2 flex gap-3">
                <input
                  type="text"
                  placeholder="Adicional"
                  className="w-full px-5 py-3 rounded-xl bg-white/10 text-white border border-gray-600"
                  value={adicional}
                  onChange={(e) => setAdicional(e.target.value)}
                />
                <button
                  type="button"
                  onClick={agregarAdicional}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-3 flex items-center gap-2 justify-center"
                >
                  <FiPlusCircle /> Agregar
                </button>
              </div>

              {adicionales.length > 0 && (
                <div className="sm:col-span-2">
                  <ul className="list-disc pl-6 text-sm text-cyan-300">
                    {adicionales.map((a, i) => (
                      <li key={i} className="flex justify-between items-center">
                        {a}
                        <button
                          type="button"
                          className="ml-3 bg-red-500 text-white px-2 rounded-full"
                          onClick={() => eliminarAdicional(i)}
                        >
                          <FiX />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="sm:col-span-2 w-full text-white text-sm file:bg-cyan-700 file:text-white file:rounded-xl file:px-4 file:py-2 bg-white/10 border border-gray-600 rounded-xl px-4 py-3"
            onChange={(e) => {
              const selectedFile = e.target.files[0];
              const error = validarImagenMenu(selectedFile);
              if (error) {
                Swal.fire("Archivo no válido", error, "error");
                e.target.value = "";
                return;
              }
              setFile(selectedFile);
            }}
          />

          {file && (
            <div className="sm:col-span-2">
              <p className="text-white text-sm mb-2">Vista previa:</p>
              <img
                src={URL.createObjectURL(file)}
                alt="Vista previa"
                className="h-32 object-cover rounded-xl border border-white/20"
              />
            </div>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl"
            >
              {loading ? "Agregando..." : "Agregar menú"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

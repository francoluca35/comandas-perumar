"use client";

import { useState, useRef } from "react";
import useAgregarMenu from "@/app/hooks/useAgregarMenu";
import useProductos from "@/app/hooks/useProductos";
import { validarImagenMenu } from "@/utils/validationApp";

import BackArrow from "@/app/components/ui/BackArrow";
import { FiPlusCircle, FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import ModalEditarProducto from "@/app/components/ModalEditarProducto";

export default function AgregarMenu() {
  const { agregarMenu, loading } = useAgregarMenu();
  const { productos, refetch } = useProductos(); // agregamos refetch para actualizar sin reload
  const [productoEditar, setProductoEditar] = useState(null);

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

    refetch?.(); // actualiza productos sin recargar la página
  };

  const agregarAdicional = () => {
    if (adicional) {
      setAdicionales([...adicionales, adicional]);
      setAdicional("");
    }
  };

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Este menú será eliminado permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    try {
      await fetch("/api/menu/eliminar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      Swal.fire("Eliminado", "El menú ha sido eliminado.", "success");
      refetch?.();
    } catch (error) {
      Swal.fire("Error", "Hubo un error al eliminar el menú.", "error");
    }
  };

  const handleEditar = (producto) => {
    setProductoEditar({ ...producto, tipo: producto.tipo || "comida" });
  };

  const guardarEdicion = async () => {
    const { _id, nombre, precio, precioConIVA, descuento, adicionales, tipo } =
      productoEditar;
    try {
      await fetch("/api/menu/editar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: _id,
          nombre,
          tipo,
          precio: parseInt(precio),
          precioConIVA: parseInt(precioConIVA),
          descuento: parseInt(descuento || 0),
          adicionales,
        }),
      });

      Swal.fire(
        "Actualizado",
        "El menú ha sido editado correctamente.",
        "success"
      );
      setProductoEditar(null);
      refetch?.();
    } catch (err) {
      Swal.fire("Error", "Hubo un error al editar el menú.", "error");
    }
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
              onClick={() => setModo("agregar")}
              className={`px-4 py-2 rounded-xl transition ${
                modo === "agregar"
                  ? "bg-cyan-600 text-white font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Agregar Menú
            </button>
            <button
              onClick={() => setModo("editar")}
              className={`px-4 py-2 rounded-xl transition ${
                modo === "editar"
                  ? "bg-cyan-600 text-white font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Editar / Eliminar
            </button>
          </div>
        </div>

        {modo === "agregar" ? (
          <form
            onSubmit={handleAgregar}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6"
          >
            <input
              type="text"
              placeholder="Nombre del menú"
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
        ) : (
          <>
            <div className="space-y-4">
              {productos?.map((p) => (
                <div
                  key={p._id}
                  className="flex justify-between items-center bg-white/10 p-4 rounded-xl border border-white/10 text-white"
                >
                  <div>
                    <p className="font-bold">{p.nombre}</p>
                    <p className="text-sm text-cyan-300">
                      Precio: ${p.precio} / IVA: ${p.precioConIVA}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditar(p)}
                      className="bg-orange-500 hover:bg-orange-600 text-sm px-3 py-1 rounded-xl"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(p._id)}
                      className="bg-red-600 hover:bg-red-700 text-sm px-3 py-1 rounded-xl"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {productoEditar && (
          <ModalEditarProducto
            producto={productoEditar}
            onClose={() => setProductoEditar(null)}
            refetch={refetch}
          />
        )}
      </div>
    </section>
  );
}

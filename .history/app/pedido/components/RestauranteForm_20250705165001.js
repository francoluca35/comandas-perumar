"use client";

import { useState } from "react";
import useProductos from "@/app/hooks/useProductos";
import { FiPlusCircle, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import QRCode from "react-qr-code";

export default function RestauranteForm() {
  const { productos } = useProductos();

  const [nombre, setNombre] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [pago, setPago] = useState("");
  const [urlPago, setUrlPago] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [presupuesto, setPresupuesto] = useState([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [esperandoPago, setEsperandoPago] = useState(false);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad < 1) return;
    const tipo = productos.find((p) => p.nombre === productoSeleccionado)?.tipo;
    setPresupuesto((prev) => [
      ...prev,
      {
        comida: tipo !== "bebida" ? productoSeleccionado : "",
        bebida: tipo === "bebida" ? productoSeleccionado : "",
        cantidad,
      },
    ]);
    setProductoSeleccionado("");
    setCantidad(1);
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
      return total + base + bebidaPrecio;
    }, 0);
  };

  const total = calcularTotal();

  const generarPagoQR = async () => {
    const res = await fetch("/api/mercado-pago/crear-pago-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        total,
        nombreCliente: nombre || "Cliente",
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setUrlPago(data.init_point);
      setExternalReference(data.external_reference);
      setEsperandoPago(true);
      esperarConfirmacionPago(data.external_reference);
    } else {
      Swal.fire("Error", "No se pudo generar el QR", "error");
    }
  };

  const esperarConfirmacionPago = (ref) => {
    let intentos = 0;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/mercado-pago/estado/${ref}`);
      const data = await res.json();

      if (data.status === "approved") {
        clearInterval(interval);
        setEsperandoPago(false);
        enviarPedidoFinal();
      }

      intentos++;
      if (intentos >= 24) {
        clearInterval(interval);
        setEsperandoPago(false);
        Swal.fire("Pago no confirmado", "Intenta nuevamente", "error");
      }
    }, 5000);
  };

  const enviarPedidoFinal = async () => {
    const now = new Date();
    const hora = now.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fecha = now.toLocaleDateString("es-AR");

    const payload = {
      modoPedido: "restaurante",
      tipo: "entregalocal",
      nombre,
      formaDePago: pago,
      comidas: presupuesto,
      total,
      modo: "retiro",
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
        const productosParaImprimir = presupuesto.map((item) => ({
          nombre: item.comida || item.bebida,
          cantidad: item.cantidad,
        }));

        await fetch("/api/print/envios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre,
            productos: productosParaImprimir,
            total,
            hora,
            fecha,
            metodoPago: pago,
            modo: "retiro",
          }),
        });

        Swal.fire("Pedido enviado correctamente", "", "success");
        resetFormulario();
      } else {
        Swal.fire("Error", "No se pudo enviar el pedido", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "Hubo un problema al enviar", "error");
    }
  };

  const resetFormulario = () => {
    setNombre("");
    setBusqueda("");
    setProductoSeleccionado("");
    setCantidad(1);
    setPago("");
    setPresupuesto([]);
    setUrlPago("");
    setExternalReference("");
    setEsperandoPago(false);
  };

  const manejarPedido = () => {
    if (!nombre || presupuesto.length === 0 || !pago) {
      Swal.fire("Completa todos los campos", "", "warning");
      return;
    }

    if (pago === "efectivo") {
      enviarPedidoFinal();
    } else if (pago === "qr") {
      generarPagoQR();
    }
  };

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
          <option className="text-black" value="qr">
            Mercado Pago QR
          </option>
        </select>

        {pago === "qr" && urlPago && (
          <div className="flex flex-col items-center gap-2 mb-4">
            <QRCode value={urlPago} size={200} />
            {esperandoPago && (
              <p className="text-sm text-white mt-2">
                Esperando confirmación de pago...
              </p>
            )}
          </div>
        )}

        <p className="text-right text-lg font-bold text-cyan-300 mb-4">
          Total: ${total.toFixed(2)}
        </p>

        <button
          onClick={manejarPedido}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl"
        >
          Hacer Pedido
        </button>
      </div>
    </div>
  );
}

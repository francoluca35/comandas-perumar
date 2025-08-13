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
    const seleccionado = productos.find((p) => p.nombre === productoSeleccionado);
    setAdicionalesDisponibles(seleccionado?.adicionales || []);
    setAdicionalesSeleccionados([]);
  }, [productoSeleccionado]);

  useEffect(() => {
    if (pago === "link" && !urlPago) generarPagoMP();
  }, [pago]);

  useEffect(() => {
    let interval;
    let timeout;
    if (pago === "link" && externalReference) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/mercado-pago/estado/${externalReference}`);
          const data = await res.json();
          if (data.status === "approved") {
            clearInterval(interval);
            clearTimeout(timeout);
            alert("✅ Pago aprobado. Enviando pedido...");
            enviarPedido();
          }
        } catch (err) {
          console.error("Error consultando estado de pago:", err);
        }
      }, 4000);

      timeout = setTimeout(() => {
        clearInterval(interval);
        alert("❌ No se recibió el pago a tiempo.");
      }, 120000);
    }
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [externalReference]);

  const generarPagoMP = async () => {
    const res = await fetch("/api/mercado-pago/crear-pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        total,
        mesa: nombre || "DELIVERY",
        nombreCliente: nombre || "Cliente",
      }),
    });
    const data = await res.json();
    setUrlPago(data.init_point);
    setExternalReference(data.external_reference);
  };

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

  const enviarPedido = async () => {
    if (!nombre || presupuesto.length === 0 || !direccion || !pago) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const now = new Date();
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;

    const payload = {
      modoPedido: "delivery",
      tipo: "delivery",
      nombre,
      direccion,
      mapsLink,
      observacion,
      formaDePago: pago,
      comidas: presupuesto,
      total,
      modo: "delivery",
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

      if (!res.ok) return alert("Error al enviar el pedido.");

      const productosParaImprimir = presupuesto.map((item) => ({
        nombre: item.comida || item.bebida,
      }));

      await fetch("/api/print/envios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          direccion,
          productos: productosParaImprimir,
          total,
          modo: "delivery",
        }),
      });

      alert("Pedido enviado correctamente.");
      resetFormulario();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar el pedido.");
    }
  };

  const resetFormulario = () => {
    setNombre("");
    setBusqueda("");
    setProductoSeleccionado("");
    setCantidad(1);
    setDireccion("");
    setObservacion("");
    setPago("");
    setAdicionalesSeleccionados([]);
    setPresupuesto([]);
    setUrlPago("");
    setExternalReference("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="relative">
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
        </div>

        <input
          type="number"
          min={1}
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="w-full px-4 py-2 mb-2 bg-white/10 text-white rounded-xl border border-white/20"
        />

        ...

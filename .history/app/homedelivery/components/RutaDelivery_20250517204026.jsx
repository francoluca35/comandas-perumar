"use client";

import { useEffect, useState } from "react";
import { FiMapPin } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";

export default function RutaDelivery() {
  const [pedidos, setPedidos] = useState([]);

  const fetchPedidos = async () => {
    try {
      const res = await fetch("/api/pedidos");
      const data = await res.json();
      // Solo mostramos los que están "en camino"
      const enCamino = data.filter((p) => p.estado === "en camino");
      setPedidos(enCamino);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleMapa = (url) => {
    window.open(url, "_blank");
  };

  const marcarEntregado = async (id) => {
    try {
      const res = await fetch("/api/pedidos/entregar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchPedidos(); // actualiza la lista
      }
    } catch (error) {
      console.error("Error al marcar como entregado:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white py-10 px-4">
      <h1 className="text-xl mb-6 font-semibold">Bienvenido “Username”.</h1>

      <h2 className="text-2xl font-bold text-center mb-6">MIS PEDIDOS</h2>

      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <div
            key={pedido._id}
            className="bg-[#29425e] rounded-xl p-4 flex justify-between items-center shadow-md"
          >
            <div>
              <p className="font-bold">Pedido ({pedido.nombre})</p>
              <p>
                Nmro De Orden:{" "}
                <span className="text-sm text-gray-300">{pedido._id}</span>
              </p>
              <p>Dirección: {pedido.direccion}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleMapa(pedido.mapsLink)}
                className="bg-gray-200 text-black px-3 py-1 rounded-md hover:bg-gray-300 text-sm"
              >
                <FiMapPin className="inline-block mr-1" />
                Ver Mapa
              </button>

              <button
                onClick={() => marcarEntregado(pedido._id)}
                className="bg-green-400 text-black px-3 py-1 rounded-md text-sm hover:bg-green-500"
              >
                <FaCheckCircle className="inline-block mr-1" />
                Entregado
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

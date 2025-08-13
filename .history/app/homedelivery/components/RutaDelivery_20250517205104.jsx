"use client";

import { useEffect, useState } from "react";
import { FiMapPin, FiCheck } from "react-icons/fi";
import { formatDistanceToNow, parse } from "date-fns";
import es from "date-fns/locale/es";

export default function RutaDelivery() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      const res = await fetch("/api/pedidos");
      const data = await res.json();

      // orden descendente por fecha
      const ordenados = data.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );
      setPedidos(ordenados);
    };
    fetchPedidos();
  }, []);

  const marcarEntregado = async (id) => {
    try {
      await fetch("/api/pedidos/entregar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setPedidos((prev) =>
        prev.map((p) => (p._id === id ? { ...p, estado: "entregado" } : p))
      );
    } catch (err) {
      console.error("Error actualizando estado:", err);
    }
  };

  const ahora = new Date();

  const pedidosEnCamino = pedidos.filter((p) => p.estado === "en camino");
  const pedidosEntregados = pedidos.filter((p) => {
    if (p.estado !== "entregado") return false;
    const horaEntrega = new Date(p.fecha);
    const horasPasadas = (ahora - horaEntrega) / 1000 / 60 / 60;
    return horasPasadas < 8;
  });

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      <h1 className="text-xl mb-4 font-semibold">Bienvenido “Username”.</h1>
      <h2 className="text-center text-2xl font-bold mb-6">MIS PEDIDOS</h2>

      {pedidosEnCamino.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">En camino</h3>
          {pedidosEnCamino.map((pedido) => (
            <div
              key={pedido._id}
              className="bg-blue-800 p-4 rounded-xl mb-4 flex justify-between items-center"
            >
              <div>
                <p className="font-bold">Pedido ({pedido.nombre})</p>
                <p className="text-sm">
                  N° de Orden: {pedido._id}
                  <br /> Dirección: {pedido.direccion}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={pedido.mapsLink}
                  target="_blank"
                  className="bg-white text-black px-3 py-1 rounded-md flex items-center gap-1"
                >
                  <FiMapPin /> Ver Mapa
                </a>
                <button
                  onClick={() => marcarEntregado(pedido._id)}
                  className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1"
                >
                  <FiCheck /> Entregado
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pedidosEntregados.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">
            Entregados (últimas 8 horas)
          </h3>
          {pedidosEntregados.map((pedido) => (
            <div
              key={pedido._id}
              className="bg-green-800 p-4 rounded-xl mb-4 flex justify-between items-center"
            >
              <div>
                <p className="font-bold">Pedido ({pedido.nombre})</p>
                <p className="text-sm">
                  N° de Orden: {pedido._id}
                  <br /> Dirección: {pedido.direccion}
                </p>
              </div>
              <a
                href={pedido.mapsLink}
                target="_blank"
                className="bg-white text-black px-3 py-1 rounded-md flex items-center gap-1"
              >
                <FiMapPin /> Ver Mapa
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

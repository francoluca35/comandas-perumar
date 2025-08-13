"use client";
import { useEffect, useState } from "react";

export default function Cocina() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    try {
      const res = await fetch("/api/cocina");
      const data = await res.json();
      setPedidos(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  if (loading) return <p className="text-white">Cargando pedidos...</p>;

  return (
    <div className="p-6 min-h-screen bg-black text-white">
      <h2 className="text-2xl font-bold mb-6">👨‍🍳 Pedidos en Cocina</h2>
      <div className="space-y-4">
        {pedidos.map((pedido, idx) => (
          <div
            key={idx}
            className="bg-white/10 p-4 rounded-xl border border-white/20"
          >
            <p className="font-bold">🪑 Mesa: {pedido.mesa}</p>
            <p>👤 Cliente: {pedido.cliente}</p>
            <p>🕒 Hora: {pedido.hora}</p>
            <ul className="list-disc pl-6 mt-2 text-sm">
              {pedido.productos.map((prod, i) => (
                <li key={i}>
                  {prod.nombre} x {prod.cantidad}{" "}
                  {prod.adicionales?.length > 0 &&
                    `+ ${prod.adicionales.join(", ")}`}
                </li>
              ))}
            </ul>
            <p className="text-xs text-yellow-400 mt-2">
              Estado: {pedido.estado}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

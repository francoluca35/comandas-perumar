// /hooks/useMaps.js
import { useEffect, useState } from "react";

export default function useMaps() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await fetch("/api/maps");
        const data = await res.json();
        setPedidos(data);
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  return { pedidos, loading };
}

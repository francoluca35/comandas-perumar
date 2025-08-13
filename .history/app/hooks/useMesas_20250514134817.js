"use client";
import { useEffect, useState } from "react";

export default function useMesas() {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const res = await fetch("/api/mesas");
        const data = await res.json();
        setMesas(data);
      } catch (err) {
        console.error("Error cargando mesas", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMesas();
  }, []);

  return { mesas, loading, setMesas };
}

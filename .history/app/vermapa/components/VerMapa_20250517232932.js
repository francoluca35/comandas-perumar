"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import useUbicacion from "@/app/hooks/useUbicacion";

export default function VerMapa() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pedido, setPedido] = useState(null);
  const [seguimientoActivo, setSeguimientoActivo] = useState(false);
  const mapRef = useRef(null);
  const destinoRef = useRef(null);
  const markerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [duracionEstimanda, setDuracionEstimanda] = useState(null);

  const { iniciarSeguimiento } = useUbicacion();

  useEffect(() => {
    if (id) {
      fetch(`/api/pedidos/${id}`)
        .then((res) => res.json())
        .then((data) => setPedido(data));
    }
  }, [id]);

  useEffect(() => {
    if (pedido && window.google) {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.6037, lng: -58.3816 },
        zoom: 14,
        disableDefaultUI: true,
      });
      mapRef.current = map;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: pedido.direccion }, (results, status) => {
        if (status === "OK") {
          const destino = results[0].geometry.location;
          destinoRef.current = destino;

          new window.google.maps.Marker({
            position: destino,
            map,
            title: pedido.direccion,
          });

          if (seguimientoActivo) {
            iniciarSeguimiento(
              mapRef.current,
              destinoRef.current,
              markerRef,
              directionsRendererRef,
              setDuracionEstimanda
            );
          }
        } else {
          console.error("No se pudo obtener coordenadas:", status);
        }
      });
    }
  }, [pedido]);

  useEffect(() => {
    if (seguimientoActivo && mapRef.current && destinoRef.current) {
      iniciarSeguimiento(
        mapRef.current,
        destinoRef.current,
        markerRef,
        directionsRendererRef,
        setDuracionEstimanda
      );
    }
  }, [seguimientoActivo]);

  if (!pedido) return <p className="text-white p-4">Cargando mapa...</p>;

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* MAPA */}
      <div id="map" className="w-full h-screen" />

      {/* Panel inferior estilo Uber */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-gray-700 rounded-t-3xl px-6 py-5 shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">{pedido.nombre}</h2>
          {duracionEstimanda && (
            <p className="text-green-400 text-sm">⏱ {duracionEstimanda}</p>
          )}
        </div>

        <p className="text-sm text-gray-300 mb-2">
          🧭 Dirección: <span className="font-medium">{pedido.direccion}</span>
        </p>

        <p className="text-sm text-gray-300 mb-2">
          💰 Total a pagar:{" "}
          <span className="font-semibold">${pedido.total}</span>
        </p>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setSeguimientoActivo(true)}
            className={`w-full py-3 rounded-full font-semibold transition duration-300 ${
              seguimientoActivo
                ? "bg-green-600 text-white"
                : "bg-white text-black hover:bg-gray-300"
            }`}
          >
            {seguimientoActivo ? "🟢 Seguimiento activo" : "Iniciar ruta"}
          </button>
        </div>
      </div>
    </div>
  );
}

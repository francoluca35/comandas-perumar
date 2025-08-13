"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import useUbicacion from "@/app/hooks/useUbicacion";

export default function VerMapa() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pedido, setPedido] = useState(null);
  const [seguimientoActivo, setSeguimientoActivo] = useState(false);
  const [duracionEstimanda, setDuracionEstimanda] = useState(null);

  const mapRef = useRef(null);
  const destinoRef = useRef(null);
  const markerRef = useRef(null);
  const directionsRendererRef = useRef(null);

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
              map,
              destino,
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

  if (!pedido) return <p className="text-white">Cargando mapa...</p>;

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Mapa de fondo */}
      <div id="map" className="absolute inset-0 z-0" />

      {/* Panel inferior */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <div className="bg-black/90 backdrop-blur-md text-white rounded-3xl p-5 shadow-xl border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">{pedido.nombre}</h2>
            {duracionEstimanda && (
              <span className="text-sm text-green-400">
                ⏱ {duracionEstimanda}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-300 mb-1">
            📍 Dirección:{" "}
            <span className="font-medium">{pedido.direccion}</span>
          </p>

          <p className="text-sm text-gray-300 mb-3">
            💰 Total: <span className="font-semibold">${pedido.total}</span>
          </p>

          <button
            onClick={() => setSeguimientoActivo(true)}
            className={`w-full py-3 rounded-full font-bold transition duration-300 ${
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

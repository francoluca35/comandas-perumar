"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import useUbicacion from "@/app/hooks/useUbicacion";

export default function VerMapa() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pedido, setPedido] = useState(null);
  const [destino, setDestino] = useState(null);
  const [seguimientoActivo, setSeguimientoActivo] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const iniciarSeguimiento = useUbicacion(
    destino,
    mapRef.current,
    directionsRendererRef.current
  );

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
          const ubicacionDestino = results[0].geometry.location;
          setDestino(ubicacionDestino);

          new window.google.maps.Marker({
            position: ubicacionDestino,
            map,
            title: pedido.direccion,
          });

          if (!directionsRendererRef.current) {
            directionsRendererRef.current =
              new window.google.maps.DirectionsRenderer();
            directionsRendererRef.current.setMap(map);
          }
        } else {
          console.error("No se pudo obtener coordenadas:", status);
        }
      });
    }
  }, [pedido]);

  const handleIniciar = () => {
    setSeguimientoActivo(true);
  };

  useEffect(() => {
    if (
      seguimientoActivo &&
      destino &&
      mapRef.current &&
      directionsRendererRef.current
    ) {
      iniciarSeguimiento;
    }
  }, [seguimientoActivo, destino]);

  if (!pedido) return <p className="text-white">Cargando mapa...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-2xl mb-4">Dirección: {pedido.direccion}</h2>
      <div id="map" className="w-full h-[80vh] rounded-lg shadow-lg mb-4" />
      <button
        onClick={handleIniciar}
        disabled={seguimientoActivo}
        className={`px-6 py-3 rounded-lg font-bold transition ${
          seguimientoActivo
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {seguimientoActivo ? "Seguimiento activo" : "Comenzar ruta"}
      </button>
    </div>
  );
}

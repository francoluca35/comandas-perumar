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
  const markerRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const iniciarSeguimiento = (map, destino) => {
    if (!navigator.geolocation) return alert("Geolocalización no soportada");

    const directionsService = new window.google.maps.DirectionsService();
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer(
        { suppressMarkers: false }
      );
      directionsRendererRef.current.setMap(map);
    }

    navigator.geolocation.watchPosition(
      (pos) => {
        const ubicacion = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // marcador del usuario
        if (!markerRef.current) {
          markerRef.current = new window.google.maps.Marker({
            position: ubicacion,
            map,
            title: "Tu ubicación",
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          });
        } else {
          markerRef.current.setPosition(ubicacion);
        }

        directionsService.route(
          {
            origin: ubicacion,
            destination: destino,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK") {
              directionsRendererRef.current.setDirections(result);
            } else {
              console.error("Error ruta:", status);
            }
          }
        );
      },
      (err) => console.error("Error geolocalización:", err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
          new window.google.maps.Marker({
            position: destino,
            map,
            title: pedido.direccion,
          });

          if (seguimientoActivo) iniciarSeguimiento(map, destino);
        } else {
          console.error("No se pudo obtener coordenadas:", status);
        }
      });
    }
  }, [pedido, seguimientoActivo]);

  if (!pedido) return <p className="text-white">Cargando mapa...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-2xl mb-4">Dirección: {pedido.direccion}</h2>
      <div id="map" className="w-full h-[80vh] rounded-lg shadow-lg" />
      <button
        onClick={() => setSeguimientoActivo(true)}
        className="fixed bottom-4 left-4 bg-black text-white px-4 py-2 rounded-full shadow-md border border-white"
      >
        {seguimientoActivo ? "🟢 Seguimiento activo" : "Iniciar ruta"}
      </button>
    </div>
  );
}

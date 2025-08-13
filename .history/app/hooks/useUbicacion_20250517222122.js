// hooks/useUbicacion.js
"use client";
import { useState, useEffect } from "react";

export default function useUbicacion(destino, map, directionsRenderer) {
  const [userMarker, setUserMarker] = useState(null);

  useEffect(() => {
    if (!destino || !map || !directionsRenderer) return;

    const directionsService = new window.google.maps.DirectionsService();

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const ubicacion = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // Crear o actualizar marcador de usuario
        if (!userMarker) {
          const marker = new window.google.maps.Marker({
            position: ubicacion,
            map,
            title: "Tu ubicación",
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          });
          setUserMarker(marker);
        } else {
          userMarker.setPosition(ubicacion);
        }

        // Calcular ruta
        directionsService.route(
          {
            origin: ubicacion,
            destination: destino,
            travelMode: "DRIVING",
          },
          (result, status) => {
            if (status === "OK") {
              directionsRenderer.setDirections(result);
            } else {
              console.error("Error ruta:", status);
            }
          }
        );
      },
      (err) => console.error("Error geolocalización:", err),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [destino, map, directionsRenderer]);

  return null;
}

// hooks/useUbicacion.js
"use client";
import { useRef } from "react";

export default function useUbicacion() {
  const markerRef = useRef(null);

  const iniciarSeguimiento = (map, destino, directionsRenderer) => {
    const directionsService = new window.google.maps.DirectionsService();

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const ubicacion = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        if (!markerRef.current) {
          const marker = new window.google.maps.Marker({
            position: ubicacion,
            map,
            title: "Tu ubicación",
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          });
          markerRef.current = marker;
        } else {
          markerRef.current.setPosition(ubicacion);
        }

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
      (err) => console.error("Geoloc error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  };

  return { iniciarSeguimiento };
}

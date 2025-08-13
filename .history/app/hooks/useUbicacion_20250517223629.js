// hooks/useUbicacion.js
"use client";
import { useEffect, useRef } from "react";

export default function useUbicacion() {
  const watchIdRef = useRef(null);

  const iniciarSeguimiento = (
    map,
    destino,
    markerRef,
    directionsRendererRef
  ) => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer(
        {
          suppressMarkers: true,
        }
      );
      directionsRendererRef.current.setMap(map);
    }

    // Iniciar seguimiento
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const ubicacion = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // Crear marcador o actualizar posición
        if (!markerRef.current) {
          markerRef.current = new window.google.maps.Marker({
            position: ubicacion,
            map,
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            title: "Tu ubicación",
          });
        } else {
          markerRef.current.setPosition(ubicacion);
        }

        // Calcular ruta
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
              console.error("No se pudo calcular la ruta:", status);
            }
          }
        );
      },
      (err) => console.error("Error en geolocalización:", err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Opcional: función para detener seguimiento
  const detenerSeguimiento = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  };

  return { iniciarSeguimiento, detenerSeguimiento };
}

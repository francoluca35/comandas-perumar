"use client";

import { useState, useEffect, Suspense } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

import PrivateRoute from "../models/PrivateRoute";
import { useAuth } from "@/context/AuthContext";
import TablaMetrica from "../components/ui/TablaMetrica";
import BotonesMenu from "../components/ui/BotonesMenu";
import UserDropdown from "../components/ui/UserDropdown";
import AbrirCaja from "../components/ui/AbrirCaja";

export default function ScreenHome() {
  const { user } = useAuth();
  const fecha = new Date().toLocaleDateString("es-AR");
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    if (user?.rol === "admin") {
      const mostrarAlIniciar = sessionStorage.getItem("mostrarCaja");

      if (mostrarAlIniciar === "true") {
        setMostrarModal(true);
        sessionStorage.removeItem("mostrarCaja");
      }

      const handleAbrirCaja = () => {
        setMostrarModal(true);
      };

      window.addEventListener("abrirCaja", handleAbrirCaja);

      // 🔔 Escucha cambios en tickets pendientes desde Firebase
      const ticketRef = dbRef(db, "tickets");
      const unsubscribe = onValue(ticketRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const pendientes = Object.values(data).filter(
            (t) => t.estado === "pendiente"
          );

          if (pendientes.length > 0) {
            pendientes.forEach((ticket) => {
              // Esto podés adaptarlo para mostrar visualmente cada alerta
              console.log(`⚠ Mesa ${ticket.mesa} ya pagó, imprimir ticket`);
            });

            // ⏰ Ejemplo: mostrar una alerta grande si pasan 3 minutos
            pendientes.forEach((ticket) => {
              const tiempoPasado = Date.now() - new Date(ticket.hora).getTime();
              if (tiempoPasado > 3 * 60 * 1000) {
                alert(
                  `⚠ ATENCIÓN: Ya pasaron más de 3 minutos desde el pago de la mesa ${ticket.mesa}. Imprimir ticket urgente.`
                );
              }
            });
          }
        }
      });

      return () => {
        window.removeEventListener("abrirCaja", handleAbrirCaja);
        unsubscribe();
      };
    }
  }, [user]);

  return (
    <PrivateRoute>
      <main className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 p-6 text-white flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-semibold">
            Bienvenido {user?.nombreCompleto} - {fecha}
          </h2>
          <UserDropdown onAbrirCaja={() => setMostrarModal(true)} />
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 flex-grow">
          <Suspense
            fallback={<p className="text-gray-400">Cargando menú...</p>}
          >
            <BotonesMenu />
          </Suspense>
        </div>

        <AbrirCaja
          visible={mostrarModal}
          onClose={() => setMostrarModal(false)}
        />
      </main>
    </PrivateRoute>
  );
}

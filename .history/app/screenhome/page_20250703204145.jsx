"use client";

import { useState, useEffect, Suspense } from "react";
import PrivateRoute from "../models/PrivateRoute";
import { useAuth } from "@/context/AuthContext";
import TablaMetrica from "../components/ui/TablaMetrica";
import BotonesMenu from "../components/ui/BotonesMenu";
import UserDropdown from "../components/ui/UserDropdown";
import AbrirCaja from "../components/ui/AbrirCaja";
import { db } from "@/lib/firebase";
import { onValue, ref, remove } from "firebase/database";

export default function ScreenHome() {
  const { user } = useAuth();
  const fecha = new Date().toLocaleDateString("es-AR");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ticketPendiente, setTicketPendiente] = useState(null);

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

      const ticketsRef = ref(db, "tickets");
      const unsubscribe = onValue(ticketsRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        Object.entries(data).forEach(([mesa, ticket]) => {
          if (ticket.estado === "pendiente") {
            const tiempo = new Date(ticket.hora);
            const ahora = new Date();
            const diferenciaMinutos = (ahora - tiempo) / 60000;

            setTicketPendiente({ ...ticket, mesa });

            if (diferenciaMinutos > 3) {
              alert(
                `⚠️ ¡Hace más de 3 minutos que la Mesa ${mesa} pagó! Imprimí el ticket.`
              );
            }
          }
        });
      });

      return () => {
        window.removeEventListener("abrirCaja", handleAbrirCaja);
        unsubscribe();
      };
    }
  }, [user]);

  const imprimirTicket = async () => {
    if (!ticketPendiente) return;

    await fetch("http://localhost:4000/print-ticket-pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mesa: ticketPendiente.mesa,
        productos: ticketPendiente.productos,
        total: ticketPendiente.total,
        metodoPago: ticketPendiente.metodo,
      }),
    });

    await remove(ref(db, `tickets/${ticketPendiente.mesa}`));
    setTicketPendiente(null);
  };

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

          {ticketPendiente && (
            <div className="fixed right-4 top-24 bg-yellow-300 text-black p-4 rounded-xl shadow-xl z-50 w-72">
              <h2 className="text-lg font-bold">🧾 Ticket pendiente</h2>
              <p>Mesa: {ticketPendiente.mesa}</p>
              <p>Total: ${ticketPendiente.total.toFixed(2)}</p>
              <p>Pago: {ticketPendiente.metodo}</p>
              <button
                onClick={imprimirTicket}
                className="mt-3 bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded-lg font-semibold"
              >
                🖨️ Imprimir ticket
              </button>
            </div>
          )}
        </div>

        <AbrirCaja
          visible={mostrarModal}
          onClose={() => setMostrarModal(false)}
        />
      </main>
    </PrivateRoute>
  );
}

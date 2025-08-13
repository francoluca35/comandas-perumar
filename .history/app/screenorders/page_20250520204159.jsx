"use client";

import React, { Suspense } from "react";
import Cocina from "./components/cocina";

export default function ScreenOrders() {
  return (
    <div>
      <Suspense
        fallback={<p className="text-white p-4">Cargando pedidos...</p>}
      >
        <Cocina />
      </Suspense>
    </div>
  );
}

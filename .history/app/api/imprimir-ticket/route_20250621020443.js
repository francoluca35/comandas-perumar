export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { mesa, total, metodoPago } = await req.json();

    // Podés reemplazar estos valores por los reales según tu sistema
    const fecha = new Date().toLocaleDateString("es-AR");
    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const html = `
      <html>
        <head>
          <style>
            @page { size: 58mm auto; margin: 0; }
            @media print {
              html, body {
                width: 54mm;
                margin: 0;
                padding: 0;
                transform: scale(0.90);
                transform-origin: top left;
              }
            }
            body {
              font-family: monospace;
              font-size: 12px;
              width: 52mm;
              margin: 0;
              text-align: center;
            }
            h2 { margin: 5px 0; font-size: 14px; }
            .logo { width: 80px; margin-bottom: 5px; }
            hr { border: none; border-top: 1px dashed #000; margin: 5px 0; }
            .item { display: flex; justify-content: space-between; margin: 2px 0; }
            .total { font-weight: bold; font-size: 14px; }
            .footer { font-size: 10px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <img src="${
            process.env.NEXT_PUBLIC_BASE_URL
          }/Assets/logo-oficial.png" class="logo" />
          <h2>🍽️ Perú Mar</h2>
          <h1>Mesa: ${mesa}</h1>
          <h1>Hora: ${hora}</h1>
          <h1>Fecha: ${fecha}</h1>
          <hr />
          <div class="item total"><span>Total:</span><span>$${parseFloat(
            total
          ).toFixed(2)}</span></div>
          <div class="item"><span>Pago:</span><span>${metodoPago}</span></div>
          <hr />
          <div class="footer">
            <h1>Tel: 1140660136</h1>
            <h1>Dirección: Rivera 2495 V. Celina</h1>
            <h1>Gracias por su visita!</h1>
          </div>
          <script>window.onload = function() { window.print(); setTimeout(() => window.close(), 1000); }</script>
        </body>
      </html>
    `;

    // Abrimos una ventana nueva desde el backend con Puppeteer o tu sistema de impresión
    // Si usás una API local para impresora, llamala acá

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Error al imprimir:", err);
    return new Response("Error interno", { status: 500 });
  }
}

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { mesa, productos, orden, hora, fecha } = await req.json();

    const html = `
      <html>
        <head>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body {
              font-family: monospace;
              font-size: 18px;
              width: 80mm;
              margin: 0;
              padding: 0;
              text-align: center;
            }
            h1 { font-size: 28px; margin: 10px 0 4px; }
            h2 { font-size: 20px; margin: 4px 0; }
            .item {
              font-size: 20px;
              text-align: left;
              margin: 6px 20px;
            }
            hr {
              border: none;
              border-top: 2px dashed #000;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <h1>PERU MAR</h1>
          <h2>Mesa: ${mesa}</h2>
          <h2>Orden: ${orden}</h2>
          <h2>Hora: ${hora}</h2>
          <h2>Fecha: ${fecha}</h2>
          <hr />
          ${productos
            .map((p) => `<div class="item">${p.cantidad}x ${p.nombre}</div>`)
            .join("")}
          <hr />
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error al generar ticket:", error);
    return NextResponse.json(
      { error: "Error al generar el ticket" },
      { status: 500 }
    );
  }
}

import express from "express";
import fetch from "node-fetch"; // <-- si no lo tenés: npm install node-fetch

const router = express.Router();

// RUTA PARA IMPRIMIR
router.post("/print", async (req, res) => {
  try {
    const response = await fetch("http://localhost:4000/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.text();
    res.status(200).send(data);
  } catch (err) {
    console.error("Error proxy impresión:", err);
    res
      .status(500)
      .json({ error: "Error al conectar con el servidor de impresión" });
  }
});

export default router;

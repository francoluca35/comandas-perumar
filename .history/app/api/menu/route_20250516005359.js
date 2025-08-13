import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { nombre, adicionales, precio, precioConIVA, descuento } = req.body;

    if (!nombre || !precio || !precioConIVA || !Array.isArray(adicionales)) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const nuevoMenu = {
      nombre,
      adicionales,
      precio,
      precioConIVA,
      ...(descuento && { descuento }),
    };

    const result = await db.collection("menus").insertOne(nuevoMenu);

    res
      .status(201)
      .json({ message: "Menú agregado correctamente", id: result.insertedId });
  } catch (error) {
    console.error("Error agregando menú:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
}

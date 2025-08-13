import { MongoClient } from "mongodb";

// Cargamos la URI desde las env vars
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Por favor define MONGODB_URI en tu archivo .env.local");
}

// Opciones modernas optimizadas para producción
const options = {
  maxPoolSize: 10, // Cantidad máxima de conexiones simultáneas (ajustable según tráfico)
  minPoolSize: 0,
  serverSelectionTimeoutMS: 5000, // Cuánto tiempo espera antes de fallar en la selección de servidor
  socketTimeoutMS: 10000, // Tiempo máximo de espera de un socket antes de abortar
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // 🔄 En desarrollo, reutilizamos el mismo cliente (para evitar múltiples conexiones en hot reload)
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 🔒 En producción, creamos una conexión directa (serverless friendly)
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

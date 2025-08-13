import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!process.env.MONGODB_URI) {
  throw new Error("Por favor define MONGODB_URI en .env.local");
}

// ✅ Agregamos las opciones de conexión para solucionar el problema SSL
const options = {
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URI: "mongodb+srv://deamoncompany18:Ek6Y58VSLxtAcx7x@cluster0.enk7rhv.mongodb.net/comandas?retryWrites=true&w=majority",
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">QR Menu</h1>
        <p className="text-xl">Menús digitales para restaurantes</p>
        <a 
          href="https://tudominio.com" 
          className="mt-8 inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition"
        >
          Crear mi menú →
        </a>
      </div>
    </div>
  )
}
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-black mb-4">404</h2>
        <p className="text-gray-600 mb-6">Página no encontrada</p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

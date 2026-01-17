"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ImageRotatorProps {
  images: string[]
  title?: string
  autoRotate?: boolean
  rotationDelay?: number // en milisegundos, default 2000 (2 segundos)
}

export default function ImageRotator({
  images,
  title = "Galería",
  autoRotate = true,
  rotationDelay = 2000,
}: ImageRotatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())

  // Filtrar imágenes válidas y no vacías
  const validImages = images.filter((img) => img && img.length > 0)

  // Manejar cuando se carga exitosamente una imagen
  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set([...prev, index]))
  }

  // Manejar cuando falla la carga de una imagen
  const handleImageError = (index: number, imageUrl: string) => {
    console.error(`Error loading image at index ${index}:`, imageUrl)
    setFailedImages((prev) => new Set([...prev, index]))
  }

  // Si no hay imágenes válidas, mostrar placeholder
  if (validImages.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm font-medium">Sin imágenes</p>
        </div>
      </div>
    )
  }

  // Si solo hay una imagen, mostrarla sin controles
  if (validImages.length === 1) {
    return (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden flex items-center justify-center">
        <img
          src={validImages[0]}
          alt={title}
          className="w-full h-full object-contain"
          onLoad={() => handleImageLoad(0)}
          onError={() => handleImageError(0, validImages[0])}
        />
      </div>
    )
  }

  // Configurar auto-rotación
  useEffect(() => {
    if (!isAutoRotating) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length)
    }, rotationDelay)

    return () => clearInterval(timer)
  }, [isAutoRotating, validImages.length, rotationDelay])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
    setIsAutoRotating(false)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length)
    setIsAutoRotating(false)
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
    setIsAutoRotating(false)
  }

  const handleMouseEnter = () => {
    setIsAutoRotating(false)
  }

  const handleMouseLeave = () => {
    setIsAutoRotating(autoRotate)
  }

  return (
    <div
      className="w-full h-full bg-white rounded-lg overflow-hidden relative flex items-center justify-center group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Imagen actual */}
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        {!failedImages.has(currentIndex) ? (
          <img
            key={currentIndex}
            src={validImages[currentIndex]}
            alt={`${title} - Imagen ${currentIndex + 1}`}
            className="w-full h-full object-contain transition-opacity duration-300"
            onLoad={() => handleImageLoad(currentIndex)}
            onError={() => handleImageError(currentIndex, validImages[currentIndex])}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-xs font-medium">Imagen no disponible</p>
            </div>
          </div>
        )}
      </div>

      {/* Botón anterior */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100 z-10"
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Botón siguiente */}
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100 z-10"
            aria-label="Siguiente imagen"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicadores de puntos */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white bg-opacity-50 hover:bg-opacity-75"
                }`}
                aria-label={`Ver imagen ${index + 1}`}
              />
            ))}
          </div>

          {/* Contador de imágenes */}
          <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {currentIndex + 1} / {validImages.length}
          </div>
        </>
      )}
    </div>
  )
}

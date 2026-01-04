"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
          }}
          aria-label="Subir al inicio"
          title="Subir al inicio"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  )
}

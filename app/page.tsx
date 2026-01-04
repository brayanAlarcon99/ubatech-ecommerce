'use client';

import React from 'react';
import Link from 'next/link';
import { STORES } from '@/lib/config/stores';

export default function Landing() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-2 sm:p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">Elige tu tienda</h1>
          <p className="text-gray-600 text-base sm:text-lg">Selecciona la tienda que deseas visitar</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
          {Object.entries(STORES).map(([key, store]) => (
            <Link
              key={key}
              href={`/${store.slug}`}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 block"
            >
              <div 
                className="p-6 sm:p-12 text-center min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center"
                style={{ backgroundColor: store.color }}
              >
                <div className="mb-3 sm:mb-6">
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold"
                    style={{ color: store.color }}
                  >
                    {store.name.charAt(0)}
                  </div>
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">{store.name}</h2>
                <p className="text-white text-opacity-90 mb-4 sm:mb-6 text-xs sm:text-base">{store.description}</p>
                <span 
                  className="inline-block px-4 sm:px-6 py-2 bg-white rounded-lg font-semibold group-hover:scale-105 transition-transform text-xs sm:text-base"
                  style={{ color: store.color }}
                >
                  Ir a {store.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Configuración centralizada de la aplicación
 * Un único lugar para mantener constantes, valores por defecto y configuración
 */

// ============================================================================
// CONFIGURACIÓN DE TIENDAS
// ============================================================================

export interface StoreConfig {
  id: string
  name: string
  email: string
  /**
   * ☎️ Teléfono / WhatsApp - Un único número para toda la tienda
   * Se usa en: contacto, carrito, checkout, footer, etc.
   */
  phone: string
  address: string
  businessHours: string
  mapsUrl: string
  logo: string
  primaryColor: string
  secondaryColor: string
  description: string
  aboutUs: string
  instagram?: string
  facebook?: string
  tiktok?: string
}

export const STORES_CONFIG: Record<string, StoreConfig> = {
  djcelutecnico: {
    id: 'djcelutecnico',
    name: 'DJCELUTECNICO',
    email: 'djcelutecnico@gmail.com',
    phone: '+57 3203558473',
    address: 'Cra. 7 # 9-72, Ubaté, Cundinamarca, Colombia',
    businessHours: 'Lunes - Viernes: 8am - 6pm',
    mapsUrl: 'https://www.google.com/maps/place/Djcelutecnico/@5.3091793,-73.8131533,3a,75y,157.32h,105.82t/data=!3m7!1e1!3m5!1slHSlJIsSDnObsjD4hXK_UA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-15.819999999999993%26panoid%3DlHSlJIsSDnObsjD4hXK_UA%26yaw%3D157.32!7i16384!8i8192!4m17!1m9!3m8!1s0x8e40385c7a9fe659:0x214002c0c575d2!2sCra.+7+%23+9-72,+Ubat%C3%A9,+Villa+de+San+Diego+de+Ubat%C3%A9,+Cundinamarca!3b1!8m2!3d5.309132!4d-73.813137!10e5!16s%2Fg%2F11m62rzplt!3m6!1s0x8e4039f96bfe3f27:0x32c874342d4b68da!8m2!3d5.3091399!4d-73.8131219!10e5!16s%2Fg%2F11h129n8_7?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D',
    logo: '/logo-djcelutecnico.jpg',
    primaryColor: '#a00009',
    secondaryColor: '#000000',
    description: 'Tu tienda DJCelutecnico - Especialistas en tecnología y electrónica',
    aboutUs: 'En DJCELUTECNICO somos especialistas en tecnología y soluciones para el hogar, la oficina y el entretenimiento. Dedicados a ofrecer productos de alta calidad que respondan a tus necesidades.',
    instagram: 'https://instagram.com/djcelutecnico',
    facebook: 'https://facebook.com/djcelutecnico',
  },
  ubatech: {
    id: 'ubatech',
    name: 'Ubatech+Pro',
    email: 'info@ubatech.com',
    phone: '+57 3134588107',
    address: 'Cl. 10 #7-39, Ubaté, Villa de San Diego de Ubaté, Cundinamarca',
    businessHours: 'Lunes - Viernes: 8am - 6pm, Sábado: 9am - 2pm',
    mapsUrl: 'https://www.google.com/maps/search/Cl.+10+%23+7-39,+Ubat%C3%A9,+Villa+de+San+Diego+de+Ubat%C3%A9,+Cundinamarca+855P%2BRP',
    logo: '/logo-ubatech.png',
    primaryColor: '#000000',
    secondaryColor: '#4db8ff',
    description: 'Tu tienda Ubatech+Pro',
    aboutUs: 'En Ubatech+Pro somos una tienda especializada en tecnología y soluciones integrales para el hogar, la oficina y el entretenimiento. Nos dedicamos a ofrecer productos y servicios de alta calidad que respondan a las necesidades reales de nuestros clientes, siempre bajo el principio fundamental de confianza y seguridad.',
    instagram: 'https://instagram.com/ubatechpro',
    facebook: 'https://facebook.com/ubatechpro',
  },
}

export const DEFAULT_STORE_ID = 'ubatech'
export const DEFAULT_STORE = STORES_CONFIG[DEFAULT_STORE_ID]

/**
 * Obtiene la configuración de una tienda por ID
 */
export function getStoreConfig(storeId?: string): StoreConfig {
  if (!storeId || !STORES_CONFIG[storeId]) {
    return DEFAULT_STORE
  }
  return STORES_CONFIG[storeId]
}

// ============================================================================
// CONFIGURACIÓN DE FIRESTORE (Colecciones y Documentos)
// ============================================================================

export const FIRESTORE_CONFIG = {
  // Colecciones
  COLLECTIONS: {
    STORES: 'stores',
    STORE_SETTINGS: 'store_settings',
    PLATFORM_INFO: 'platform_info',
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    SUBCATEGORIES: 'subcategories',
    ADMIN_USERS: 'adminUsers',
    ORDERS: 'orders',
  },

  // Documentos específicos
  DOCUMENTS: {
    STORE_SETTINGS: 'store_settings',
    PLATFORM_INFO: 'platform_info',
  },
} as const

// Atajos para uso común
export const COLLECTIONS = FIRESTORE_CONFIG.COLLECTIONS

// ============================================================================
// CONFIGURACIÓN DE PLATAFORMA POR DEFECTO
// ============================================================================

export interface PlatformInfoConfig {
  version: string
  lastUpdate: string
  supportEmail: string
  description: string
}

export const DEFAULT_PLATFORM_INFO: PlatformInfoConfig = {
  version: '1.0.0',
  lastUpdate: 'Diciembre 2025',
  supportEmail: 'support@ubatech.com',
  description: 'Plataforma de compras online',
}

// ============================================================================
// CONFIGURACIÓN DE TIENDA (Store Settings)
// ============================================================================

export interface StoreSettingsConfig {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  storeHours: string
  description: string
}

export const STORE_SETTINGS_DEFAULTS: Record<string, StoreSettingsConfig> = {
  ubatech: {
    storeName: 'Ubatech+Pro',
    storeEmail: 'info@ubatech.com',
    storePhone: '+57 3134588107',
    storeAddress: 'ubaté, colombia',
    storeHours: 'Lunes - Viernes: 8am - 6pm',
    description: 'Tienda especializada en tecnología e innovación',
  },
  djcelutecnico: {
    storeName: 'DJCELUTECNICO',
    storeEmail: 'djcelutecnico@gmail.com',
    storePhone: '+57 3203558473',
    storeAddress: 'Cra. 7 # 9-72, Ubaté, Cundinamarca, Colombia',
    storeHours: 'Lunes - Viernes: 8am - 6pm',
    description: 'Especialistas en tecnología y electrónica',
  },
}

export function getStoreSettingsDefault(storeId?: string): StoreSettingsConfig {
  const store = storeId || DEFAULT_STORE_ID
  return STORE_SETTINGS_DEFAULTS[store] || STORE_SETTINGS_DEFAULTS[DEFAULT_STORE_ID]
}

// ============================================================================
// CONFIGURACIÓN DE VALIDACIÓN
// ============================================================================

export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
  },
  EMAIL: {
    // Regex simple pero efectivo
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    // Acepta formatos comunes
    PATTERN: /^[\d\s+\-()]+$/,
  },
} as const

// ============================================================================
// CONFIGURACIÓN DE CACHE
// ============================================================================

export const CACHE_CONFIG = {
  STORE_INFO: 5 * 60 * 1000, // 5 minutos
  PLATFORM_INFO: 10 * 60 * 1000, // 10 minutos
  STORE_SETTINGS: 5 * 60 * 1000, // 5 minutos
  PRODUCTS: 15 * 60 * 1000, // 15 minutos
  CATEGORIES: 30 * 60 * 1000, // 30 minutos
} as const

// ============================================================================
// CONFIGURACIÓN DE ESTADOS Y CÓDIGOS
// ============================================================================

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
} as const

// ============================================================================
// CONFIGURACIÓN DE ERRORES
// ============================================================================

export const ERROR_MESSAGES = {
  FIRESTORE_NOT_AVAILABLE: 'Firestore is not available. Please ensure Firestore Database is created in Firebase Console.',
  DOCUMENT_NOT_FOUND: 'El documento solicitado no existe.',
  PERMISSION_DENIED: 'Permiso denegado.',
  INVALID_EMAIL: 'Email inválido.',
  WEAK_PASSWORD: 'La contraseña es muy débil (mínimo 6 caracteres).',
  EMAIL_ALREADY_IN_USE: 'Este email ya está registrado.',
  UNKNOWN_ERROR: 'Error desconocido.',
} as const

// ============================================================================
// CONFIGURACIÓN DE RUTAS Y ENDPOINTS
// ============================================================================

export const ROUTES = {
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/categories',
    SETTINGS: '/admin/settings',
    ANALYTICS: '/admin/analytics',
  },
  PUBLIC: {
    HOME: '/',
    PRODUCTS: '/products',
    CART: '/carrito',
    CHECKOUT: '/checkout',
  },
} as const

export const API_ENDPOINTS = {
  ADMIN: {
    SETTINGS: '/api/admin/settings',
    ANALYTICS: '/api/admin/analytics',
    INIT_DB: '/api/admin/init-db',
  },
  PUBLIC: {
    SETTINGS: '/api/settings',
    SYNC: '/api/sync/settings',
  },
  DEBUG: {
    SETTINGS: '/api/debug/settings',
    STORE_SETTINGS: '/api/debug/store-settings',
    CATEGORIES: '/api/debug/categories-info',
  },
} as const

// ============================================================================
// CONFIGURACIÓN DE LOGGING
// ============================================================================

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const

export const ENABLE_LOGGING = {
  FIREBASE: true,
  HOOKS: true,
  API: true,
  VALIDATION: false,
} as const

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtiene el valor de configuración con fallback
 */
export function getConfig<T>(value: T | undefined, fallback: T): T {
  return value !== undefined ? value : fallback
}

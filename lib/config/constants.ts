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
  phone: string
  address: string
  logo: string
  primaryColor: string
  secondaryColor: string
  description: string
  aboutUs: string
  whatsapp?: string
  instagram?: string
  facebook?: string
  storeName?: string
  storeEmail?: string
  storePhone?: string
  storeWhatsApp?: string
  storeAddress?: string
  storeHours?: string
}

export const STORES_CONFIG: Record<string, StoreConfig> = {
  djcelutecnico: {
    id: 'djcelutecnico',
    name: 'DJCELUTECNICO',
    email: 'djcelutecnico@gmail.com',
    phone: '+57 3203558473',
    address: 'Cra. 7 # 9-72, Ubaté, Villa de San Diego de Ubaté, Cundinamarca',
    logo: '/logo-djcelutecnico.jpg',
    primaryColor: '#a00009',
    secondaryColor: '#000000',
    description: 'Tu tienda DJCelutecnico - Especialistas en tecnología y electrónica',
    aboutUs: 'En DJCELUTECNICO somos especialistas en tecnología y soluciones para el hogar, la oficina y el entretenimiento. Dedicados a ofrecer productos de alta calidad que respondan a tus necesidades.',
    storeName: 'DJCELUTECNICO',
    storeEmail: 'djcelutecnico@gmail.com',
    storePhone: '+57 3203558473',
    storeWhatsApp: '+57 3203558473',
    storeAddress: 'Cra. 7 # 9-72, Ubaté, Cundinamarca, Colombia',
    storeHours: 'Lunes - Viernes: 8am - 6pm',
  },
  ubatech: {
    id: 'ubatech',
    name: 'Ubatech+Pro',
    email: 'contacto@ubatechpro.com',
    phone: '+54 9 8765 4321',
    address: 'Dirección de Ubatech+Pro',
    logo: '/logo-ubatech.png',
    primaryColor: '#000000',
    secondaryColor: '#4db8ff',
    description: 'Tu tienda Ubatech+Pro',
    aboutUs: 'En Ubatech+Pro somos una tienda especializada en tecnología y soluciones integrales para el hogar, la oficina y el entretenimiento. Nos dedicamos a ofrecer productos y servicios de alta calidad que respondan a las necesidades reales de nuestros clientes, siempre bajo el principio fundamental de confianza y seguridad.',
    storeName: 'Ubatech+Pro',
    storeEmail: 'info@ubatech.com',
    storePhone: '+57 3134588107',
    storeWhatsApp: '+57 3134588107',
    storeAddress: 'ubaté, colombia',
    storeHours: 'Lunes - Viernes: 8am - 6pm',
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

/**
 * Valida un email contra el patrón
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email)
}

/**
 * Valida una contraseña
 */
export function isValidPassword(password: string): boolean {
  return (
    password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH &&
    password.length <= VALIDATION_RULES.PASSWORD.MAX_LENGTH
  )
}

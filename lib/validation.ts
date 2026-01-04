/**
 * Utilidades de validación centralizadas
 * Consolida toda la lógica de validación en un lugar
 */

import { VALIDATION_RULES, isValidEmail as validateEmail, isValidPassword as validatePwd } from './config/constants'

// ============================================================================
// VALIDACIONES DE EMAIL
// ============================================================================

/**
 * Valida que un email sea válido
 * @param email Email a validar
 * @returns true si es válido
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '') {
    return false
  }
  return validateEmail(email)
}

/**
 * Valida email con mensaje de error
 * @param email Email a validar
 * @returns { valid, error }
 */
export function validateEmailWithMessage(email: string): {
  valid: boolean
  error?: string
} {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'El email es requerido' }
  }

  if (!isValidEmail(email)) {
    return { valid: false, error: 'El email ingresado es inválido' }
  }

  return { valid: true }
}

// ============================================================================
// VALIDACIONES DE CONTRASEÑA
// ============================================================================

/**
 * Valida que una contraseña sea segura
 * @param password Contraseña a validar
 * @returns true si es válida
 */
export function isValidPassword(password: string): boolean {
  if (!password) {
    return false
  }
  return validatePwd(password)
}

/**
 * Valida contraseña con mensaje de error
 * @param password Contraseña a validar
 * @returns { valid, error }
 */
export function validatePasswordWithMessage(password: string): {
  valid: boolean
  error?: string
} {
  if (!password || password.trim() === '') {
    return { valid: false, error: 'La contraseña es requerida' }
  }

  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return {
      valid: false,
      error: `La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} caracteres`,
    }
  }

  if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
    return {
      valid: false,
      error: `La contraseña no puede exceder ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} caracteres`,
    }
  }

  return { valid: true }
}

// ============================================================================
// VALIDACIONES DE FORMULARIO
// ============================================================================

export interface FormValidationResult {
  valid: boolean
  errors: Record<string, string>
}

/**
 * Valida credenciales de login
 * @param email Email
 * @param password Contraseña
 * @returns { valid, errors }
 */
export function validateLoginCredentials(
  email: string,
  password: string
): FormValidationResult {
  const errors: Record<string, string> = {}

  const emailValidation = validateEmailWithMessage(email)
  if (!emailValidation.valid) {
    errors.email = emailValidation.error || 'Email inválido'
  }

  const passwordValidation = validatePasswordWithMessage(password)
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error || 'Contraseña inválida'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Valida datos de registro
 * @param email Email
 * @param password Contraseña
 * @param passwordConfirm Confirmación de contraseña
 * @returns { valid, errors }
 */
export function validateRegistration(
  email: string,
  password: string,
  passwordConfirm: string
): FormValidationResult {
  const errors: Record<string, string> = {}

  const emailValidation = validateEmailWithMessage(email)
  if (!emailValidation.valid) {
    errors.email = emailValidation.error || 'Email inválido'
  }

  const passwordValidation = validatePasswordWithMessage(password)
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error || 'Contraseña inválida'
  }

  if (password !== passwordConfirm) {
    errors.passwordConfirm = 'Las contraseñas no coinciden'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

// ============================================================================
// VALIDACIONES DE DATOS DE TIENDA
// ============================================================================

/**
 * Valida datos de configuración de tienda
 * @param data Datos a validar
 * @returns { valid, errors }
 */
export function validateStoreSettings(data: any): FormValidationResult {
  const errors: Record<string, string> = {}

  if (!data.storeName || data.storeName.trim() === '') {
    errors.storeName = 'El nombre de la tienda es requerido'
  }

  if (!data.storeEmail || data.storeEmail.trim() === '') {
    errors.storeEmail = 'El email de la tienda es requerido'
  } else if (!isValidEmail(data.storeEmail)) {
    errors.storeEmail = 'El email de la tienda es inválido'
  }

  if (!data.storePhone || data.storePhone.trim() === '') {
    errors.storePhone = 'El teléfono de la tienda es requerido'
  }

  if (!data.storeAddress || data.storeAddress.trim() === '') {
    errors.storeAddress = 'La dirección de la tienda es requerida'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

// ============================================================================
// VALIDACIONES DE PRODUCTO
// ============================================================================

/**
 * Valida datos de producto
 * @param product Datos del producto
 * @returns { valid, errors }
 */
export function validateProduct(product: any): FormValidationResult {
  const errors: Record<string, string> = {}

  if (!product.name || product.name.trim() === '') {
    errors.name = 'El nombre del producto es requerido'
  }

  if (!product.price || product.price <= 0) {
    errors.price = 'El precio debe ser mayor a 0'
  }

  if (!product.category || product.category.trim() === '') {
    errors.category = 'La categoría es requerida'
  }

  if (!product.description || product.description.trim() === '') {
    errors.description = 'La descripción es requerida'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

// ============================================================================
// VALIDACIONES DE TELÉFONO
// ============================================================================

/**
 * Valida formato de teléfono
 * @param phone Número de teléfono
 * @returns true si es válido
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || phone.trim() === '') {
    return false
  }
  return VALIDATION_RULES.PHONE.PATTERN.test(phone)
}

/**
 * Valida teléfono con mensaje
 * @param phone Número de teléfono
 * @returns { valid, error }
 */
export function validatePhoneWithMessage(phone: string): {
  valid: boolean
  error?: string
} {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: 'El teléfono es requerido' }
  }

  if (!isValidPhone(phone)) {
    return {
      valid: false,
      error: 'El número de teléfono tiene un formato inválido',
    }
  }

  return { valid: true }
}

// ============================================================================
// UTILIDADES GENERALES
// ============================================================================

/**
 * Combina múltiples validaciones
 * @param validations Array de funciones de validación
 * @returns { valid, errors }
 */
export function combineValidations(
  validations: FormValidationResult[]
): FormValidationResult {
  const combinedErrors: Record<string, string> = {}

  for (const validation of validations) {
    Object.assign(combinedErrors, validation.errors)
  }

  return {
    valid: Object.keys(combinedErrors).length === 0,
    errors: combinedErrors,
  }
}

/**
 * Valida que un valor no esté vacío
 * @param value Valor a validar
 * @param fieldName Nombre del campo (para mensaje de error)
 * @returns { valid, error }
 */
export function validateRequired(
  value: any,
  fieldName: string = 'Este campo'
): { valid: boolean; error?: string } {
  if (value === null || value === undefined || value.toString().trim() === '') {
    return { valid: false, error: `${fieldName} es requerido` }
  }
  return { valid: true }
}

/**
 * Valida que un valor esté dentro de un rango
 * @param value Valor a validar
 * @param min Valor mínimo
 * @param max Valor máximo
 * @param fieldName Nombre del campo
 * @returns { valid, error }
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = 'El valor'
): { valid: boolean; error?: string } {
  if (value < min || value > max) {
    return {
      valid: false,
      error: `${fieldName} debe estar entre ${min} y ${max}`,
    }
  }
  return { valid: true }
}

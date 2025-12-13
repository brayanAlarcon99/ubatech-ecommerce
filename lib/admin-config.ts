import bcrypt from "bcryptjs"

// Admin configuration
export const ADMIN_CONFIG = {
  email: "admin@ubatech.com",
  // Contraseña hasheada: Admin123!
  passwordHash: "$2b$10$3uQDp5EBDeGBNBdvdkgSuOVyKz0RY8XHqTqLrHPRZJHcA/NecODlu",
}

// Verificar si una contraseña coincide con el hash del admin
export function verifyAdminPassword(password: string): boolean {
  return bcrypt.compareSync(password, ADMIN_CONFIG.passwordHash)
}

// Crear una nueva contraseña hasheada (útil para cambios de contraseña futuros)
export function hashAdminPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

// Inicializar la cuenta admin (verificación de que existe)
export function initializeAdminAccount(): void {
  if (typeof window === "undefined") {
    // Solo en servidor
    console.log("✓ Admin account initialized: admin@ubatech.com")
  }
}

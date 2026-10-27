export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Usuario válido para /register (solo alfanumérico, 3-39 chars). */
export function uniqueUsername(prefix = 'qa'): string {
  return `${prefix}${uid()}`.slice(0, 30);
}

export function uniqueEmail(prefix = 'qa'): string {
  return `${prefix}.${uid()}@example.com`;
}

export const VALID_PASSWORD = 'Passw0rd!123';

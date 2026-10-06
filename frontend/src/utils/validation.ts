const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value.trim());

/** Mirrors the backend's RegisterRequest / LoginRequest constraints. */
export const PASSWORD_MIN_LENGTH = 6;

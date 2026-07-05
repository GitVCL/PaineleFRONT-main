const DEFAULT_API_BASE_URL = 'http://localhost:3001';

export function getApiBaseUrl() {
  const rawValue = import.meta.env.VITE_API_URL;

  if (!rawValue) {
    return DEFAULT_API_BASE_URL;
  }

  const sanitizedValue = String(rawValue)
    .trim()
    .replace(/^['"`\s]+|['"`\s]+$/g, '')
    .replace(/\/+$/, '');

  if (!/^https?:\/\//i.test(sanitizedValue)) {
    return DEFAULT_API_BASE_URL;
  }

  return sanitizedValue;
}

export const API_BASE_URL = getApiBaseUrl();

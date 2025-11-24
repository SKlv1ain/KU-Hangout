const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  import.meta.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "";

export function getGoogleClientId(): string {
  return GOOGLE_CLIENT_ID;
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID);
}


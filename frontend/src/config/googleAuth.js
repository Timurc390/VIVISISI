export const GOOGLE_CLIENT_ID = (process.env.REACT_APP_GOOGLE_CLIENT_ID || '').trim();
export const IS_GOOGLE_AUTH_ENABLED = Boolean(GOOGLE_CLIENT_ID);

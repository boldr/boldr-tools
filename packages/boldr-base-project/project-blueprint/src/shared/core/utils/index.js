const navigator = global.navigator && global.navigator.userAgent;

// hasWindow = true for tests + client
export const hasWindow = typeof window !== 'undefined';
// isBrowser = true for client only
export const isBrowser =
  typeof navigator !== 'undefined' && navigator.indexOf('Node.js') === -1;

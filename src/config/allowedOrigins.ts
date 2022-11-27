// Create a whitelist of domains that are allowed to access your backend here.
// Incl. Variations of http/https.
const allowedOrigins = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://localhost:3500",
  "https://villakostnader.se",
]

export default allowedOrigins

// NOTE: When working locally there will no origin, eg, undefined.

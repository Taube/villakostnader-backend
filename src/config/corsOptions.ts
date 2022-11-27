import cors from "cors"
import ALLOWED_ORIGINS from "./allowedOrigins"

export const corsOptions: cors.CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    //
    if ((origin && ALLOWED_ORIGINS.indexOf(origin) !== -1) || !origin) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },

  optionsSuccessStatus: 200,
}

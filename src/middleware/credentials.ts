import { Request, Response, NextFunction } from "express"
import ALLOWED_ORIGINS from "../config/allowedOrigins"

const credentials = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    // If request is part of allowedOrigins, add the header to the response
    res.header(["Access-Control-Allow-Credentials", true])
    // res.headers("Access-Control-Allow-Credentials", true)
  }
  next()
}

export default credentials

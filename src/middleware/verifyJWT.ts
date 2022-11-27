import { Request, Response, NextFunction } from "express"

import jwt from "jsonwebtoken"

type Roles = Array<string>

type JWTPayload = {
  UserInfo: {
    username: string
    roles: Roles
  }
}

type ReqPayload = {
  user?: string
  roles?: Roles
}

const verifyJWT = (
  req: Request & ReqPayload,
  res: Response,
  next: NextFunction
) => {
  // both authorization/Authorization needs to be handled
  const authHeader = (
    req.headers.authorization || req.headers.Authorization
  )?.toString()

  // Check if we don't have an authHeader, and if it does not start with "Bearer "
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]
  jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`, (err, decoded) => {
    if (err) {
      return res.sendStatus(403)
    }

    if (!decoded) {
      // Invalid JWT token
      return res.sendStatus(400)
    }

    const payload = decoded as JWTPayload

    req.user = payload?.UserInfo.username
    req.roles = payload?.UserInfo.roles

    next()
  })

  /*
  original code
  const token = authHeader.split(" ")[1]
  jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`, (err, decoded) => {
    if (err) {
      return res.sendStatus(403)
    }
    req.user = decoded?.UserInfo.username
    req.roles = decoded?.UserInfo.roles
    next()
  })
  */
}

export default verifyJWT

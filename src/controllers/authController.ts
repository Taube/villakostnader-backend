import { Request, Response } from "express"

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { IUser, User } from "../models/User"
import asyncHandler from "express-async-handler"
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../config/tokenExpires"
import { FilterQuery } from "mongoose"

export interface UserRequest extends Request {
  body: {
    username?: string
    password?: string
  }
}

// @desc Login
// @route POST /auth
// @access Public
export const login = asyncHandler(async (req: any, res: any) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" })
  }

  const foundUser = (await User.findOne({
    username,
  }).exec()) as FilterQuery<IUser>

  if (!foundUser) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const match = await bcrypt.compare(password, foundUser.password)

  if (!match) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    `${process.env.ACCESS_TOKEN_SECRET}`,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  )

  const refreshToken = jwt.sign(
    { username: foundUser.username },
    `${process.env.REFRESH_TOKEN_SECRET}`,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  )

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "none", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  })

  // Send accessToken containing username and roles
  res.json({ accessToken })
})

export async function jwtVerify(token: string, secret: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return reject(err)
      }
      resolve(decoded)
    })
  })
}

type JWTPayload = {
  username: string
  roles: Array<string>
}

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
export const refresh = (req: Request, res: Response) => {
  const cookies = req.cookies

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const refreshToken = cookies.jwt

  jwtVerify(refreshToken, `${process.env.REFRESH_TOKEN_SECRET}`)
    .then(async (decoded: JWTPayload) => {
      const foundUser = (await User.findOne({
        username: decoded.username,
      }).exec()) as FilterQuery<IUser>

      if (!foundUser) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        `${process.env.ACCESS_TOKEN_SECRET}`,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
      )

      res.json({ accessToken })
    })
    .catch(() => {
      return res.status(403).json({ message: "Forbidden" })
    })
}

export const register = async (req: Request, res: Response) => {
  const { username, password, roles } = req.body

  const checkedRoles = !Array.isArray(roles) || !roles.length ? ["User"] : roles

  // Confirm data
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" })
  }

  // Check for duplicate username
  const duplicate = await User.findOne({ username }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" })
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

  const userObject = { username, password: hashedPwd, roles: checkedRoles }

  // Create and store new user
  const user = await User.create(userObject)

  if (user) {
    //created
    res.status(201).json({ message: `New user ${username} created` })
  } else {
    res.status(400).json({ message: "Invalid user data received" })
  }
}

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
export const logout = (req: Request, res: Response) => {
  const cookies = req.cookies
  if (!cookies?.jwt) {
    return res.sendStatus(204) //No content
  }
  console.log("Logout")
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true })
  res.json({ message: "Cookie cleared" })
}

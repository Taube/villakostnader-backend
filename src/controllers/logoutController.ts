import { FilterQuery } from "mongoose"
import { IUser, User } from "../models/User"

export const handleLogout = async (req: any, res: any) => {
  // On client, also delete the accessToken
  const cookies = req.cookies
  if (!cookies?.jwt) {
    console.log("No cookies JWT")
    return res.sendStatus(204) // No content
  }
  const refreshToken = cookies.jwt
  const foundUser = (await User.findOne({
    refreshToken,
  }).exec()) as FilterQuery<IUser>
  if (!foundUser) {
    console.log("Did not find user")
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true })
    return res.sendStatus(204) // No content
  }

  // Delete refreshToken in DB
  foundUser.refreshToken = foundUser.refreshToken.filter(
    (rt: string) => rt !== refreshToken
  )
  const result = await foundUser.save()
  console.log(result)

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true })
  res.sendStatus(204)
}

import { IUser, User } from "../models/User"
import { Note } from "../models/Note"
import asyncHandler from "express-async-handler"
import bcrypt from "bcrypt"
import { FilterQuery } from "mongoose"

// @desc Get all users
// @route GET /users
// @access Private
export const getAllUsers = asyncHandler(async (req: any, res: any) => {
  // Get all users from MongoDB
  const users = await User.find().select("-password").lean()

  // If no users
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" })
  }

  res.json(users)
})

// @desc Create new user
// @route POST /users
// @access Private
export const createNewUser = asyncHandler(async (req: any, res: any) => {
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
})

// @desc Update a user
// @route PATCH /users
// @access Private
export const updateUser = asyncHandler(async (req: any, res: any) => {
  const { id, username, roles, active, password } = req.body

  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" })
  }

  // Does the user exist to update?
  const user = (await User.findById(id).exec()) as FilterQuery<IUser>

  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec()

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" })
  }

  user.username = username
  user.roles = roles
  user.active = active

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10) // salt rounds
  }

  const updatedUser = await user.save()

  res.json({ message: `${updatedUser.username} updated` })
})

// @desc Delete a user
// @route DELETE /users
// @access Private
export const deleteUser = asyncHandler(async (req: any, res: any) => {
  const { id } = req.body

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" })
  }

  // Does the user still have assigned notes?
  const note = await Note.findOne({ user: id }).lean().exec()
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" })
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec()

  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  const result = await user.deleteOne()

  const reply = `Username ${result.username} with ID ${result._id} deleted`

  res.json(reply)
})
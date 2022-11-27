import express from "express"

import verifyJWT from "../middleware/verifyJWT"

import {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController"

const router = express.Router()

router.use(verifyJWT)

router
  .route("/")
  .get(getAllUsers)
  .post(createNewUser)
  .patch(updateUser)
  .delete(deleteUser)

module.exports = router

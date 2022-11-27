import express from "express"

import { login, register, refresh, logout } from "../controllers/authController"
import { loginLimiter } from "../middleware/loginLimiter"

const router = express.Router()

router.route("/").post(loginLimiter, login)
router.route("/register").post(register)
router.route("/refresh").get(refresh)
router.route("/logout").post(logout)

module.exports = router

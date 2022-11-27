// Config
import "dotenv/config"

import { corsOptions } from "./config/corsOptions"
import { connectDB } from "./config/dbConn"

// Core
import express, { Request, Response } from "express"
import path from "path"
import cors from "cors"

// Extra
import cookieParser from "cookie-parser"
import mongoose from "mongoose"

// Middleware
import { logger } from "./middleware/logEvents"
import errorHandler from "./middleware/errorHandler"

const app = express()

// Internal config
const PORT = process.env.PORT || 3500

console.log(process.env.NODE_ENV)

// Connect to MongoDB
connectDB()

// Custom middleware logger
app.use(logger)

// Cross Origin Resource Sharing
app.use(cors(corsOptions))

// Needed to handle submitted JSON from forms etc.
app.use(express.json())

// Middleware for cookies
app.use(cookieParser())

// Serve static files. Put all static files and folders in here.
// Defaults to "/". Here we set it explicitly.
app.use("/", express.static(path.join(__dirname, "public")))

app.use("/", require("./routes/root"))
app.use("/auth", require("./routes/authRoutes"))
/*
app.use("/users", require("./routes/userRoutes"))
app.use("/notes", require("./routes/noteRoutes"))
*/

app.all("*", (req: Request, res: Response) => {
  // Regex A slash followed by anything. Chain statuscode followed by file
  res.status(404)
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"))
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not found" })
  } else {
    res.type("txt").send("404 Not found")
  }
})

// Custom error handling
app.use(errorHandler)

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB")
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

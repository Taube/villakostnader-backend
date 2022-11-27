import { Request, Response, NextFunction } from "express"

import { format } from "date-fns"
import { v4 as uuid } from "uuid"

// Common Node Core modules
import fs from "fs"
import { promises as fsPromises } from "fs"
import path from "path"

const DIR_NAME = "logs"

export const logEvents = async (message: string, logName: string) => {
  const dateTime = `${format(new Date(), "yyyMMdd\tHH:mm:ss")}`
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`
  console.log(logItem)
  try {
    if (!fs.existsSync(path.join(__dirname, "..", DIR_NAME))) {
      await fsPromises.mkdir(path.join(__dirname, "..", DIR_NAME))
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", DIR_NAME, logName),
      logItem
    )
  } catch (err) {
    console.log(err)
  }
}

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const message = `${req.method}\t${req.headers.origin}\t${req.url}`
  logEvents(message, "reqLog.txt")
  console.log(`${req.method} ${req.path}`)
  next()
}

module.exports = { logger, logEvents }

import express from "express"
import path from "path"

const router = express.Router()

// Regex ^/$ = Must begin with a slash and end with a slash.
// Regex |/index.html = or match /index.html
// REgex (.html)? = makes the extension .html optional
router.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"))
})

module.exports = router

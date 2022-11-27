import express from "express"
import {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
} from "../controllers/notesController"
import verifyJWT from "../middleware/verifyJWT"

const router = express.Router()

router.use(verifyJWT)

router
  .route("/")
  .get(getAllNotes)
  .post(createNewNote)
  .patch(updateNote)
  .delete(deleteNote)

module.exports = router

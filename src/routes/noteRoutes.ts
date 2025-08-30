import { Router } from "express";
import {
  getNotesByUserIdBookId,
  getNoteById,
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController";

const noteRouter = Router();

noteRouter.get("/user/:userId/book/:bookId", getNotesByUserIdBookId);
noteRouter.get("/:id", getNoteById);
noteRouter.get("/", getAllNotes);
noteRouter.post("/", createNote);
noteRouter.put("/:id", updateNote);
noteRouter.delete("/:id", deleteNote);

export default noteRouter;

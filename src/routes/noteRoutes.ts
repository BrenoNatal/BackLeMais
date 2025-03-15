import { Router } from "express";
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  updateNote,
} from "../controllers/noteController";

const noteRouter = Router();

noteRouter.post("/", createNote);

noteRouter.get("/:id", getNoteById);
noteRouter.get("/", getAllNotes);
noteRouter.put("/:id", updateNote);
noteRouter.delete("/:id", deleteNote);

export default noteRouter;

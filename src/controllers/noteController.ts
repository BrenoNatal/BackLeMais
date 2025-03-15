import { Request, Response } from "express";
import db from "../utils/db";

export const getAllNotes = async (req, res) => {
  try {
    const allNotes = await db.note.findMany();

    res.status(200).json({ data: allNotes });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await db.note.findUnique({
      where: {
        id: noteId,
      },
    });
    res.status(200).json({ data: note });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const noteData = req.body;

    const note = await db.note.create({
      data: noteData,
    });
    res.status(200).json({ data: note });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const noteData = req.body;
    const noteId = req.params.id;

    const note = await db.note.update({
      where: {
        id: noteId,
      },
      data: noteData,
    });
    res.status(200).json({ data: note });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const noteId = req.params.id;

    const note = await db.note.delete({
      where: {
        id: noteId,
      },
    });

    res.status(200).json({ message: "Livro deletado com sucesso." });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

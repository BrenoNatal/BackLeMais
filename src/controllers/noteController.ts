import { Request, Response } from "express";
import db from "../utils/db";

// GET: Listagem e busca
export const getNotesByUserIdBookId = async (req: Request, res: Response) => {
  try {
    const { bookId, userId } = req.params;
    const notes = await db.note.findMany({
      where: {
        userOnBookBookId: bookId,
        userOnBookUserId: userId,
      },
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { title: "asc" }],
    });
    res.status(200).json({ data: notes });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getNoteById = async (req: Request, res: Response) => {
  try {
    const noteId = req.params.id;
    const note = await db.note.findUnique({
      where: {
        id: noteId,
      },
      include: { category: true },
    });
    res.status(200).json({ data: note });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllNotes = async (req: Request, res: Response) => {
  try {
    const allNotes = await db.note.findMany();
    res.status(200).json({ data: allNotes });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST: Criação
export const createNote = async (req: Request, res: Response) => {
  try {
    let noteData = req.body;
    if (!noteData.title?.trim() && !noteData.body?.trim()) {
      res
        .status(400)
        .json({ message: "O título e o corpo da anotação são obrigatórios." });
      return;
    }
    if (!noteData.categoryId) {
      const defaultCategory = await db.category.findFirst({
        where: { userId: noteData.userId, name: "Sem categoria", type: "NOTE" },
      });
      noteData.categoryId = defaultCategory.id;
    }
    const note = await db.note.create({
      data: noteData,
    });
    res.status(200).json({ data: note });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({
        message: "Já existe uma anotação com esse nome nessa categoria.",
      });
      return;
    }
    res.status(400).json({ message: error.message });
  }
};

// PUT: Atualização
export const updateNote = async (req: Request, res: Response) => {
  try {
    const noteId = req.params.id;
    let noteData = req.body;
    if (!noteData.title?.trim() && !noteData.body?.trim()) {
      res
        .status(400)
        .json({ message: "O título e o corpo da anotação são obrigatórios." });
      return;
    }
    if (!noteData.categoryId) {
      const defaultCategory = await db.category.findFirst({
        where: { userId: noteData.userId, name: "Sem categoria", type: "NOTE" },
      });
      noteData.categoryId = defaultCategory.id;
    }
    const note = await db.note.update({
      where: {
        id: noteId,
      },
      data: noteData,
    });
    res.status(200).json({ data: note });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({
        message: "Já existe uma anotação com esse nome nessa categoria.",
      });
      return;
    }
    res.status(400).json({ message: error.message });
  }
};

// DELETE: Remoção
export const deleteNote = async (req: Request, res: Response) => {
  try {
    const noteId = req.params.id;

    const note = await db.note.delete({
      where: {
        id: noteId,
      },
    });

    res.status(200).json({ message: "Nota deletada com sucesso." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

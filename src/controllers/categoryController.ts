import { Request, Response } from "express";
import db from "../utils/db";

// GET: Listagem e busca
export const getCategoriesByUser = async (req: Request, res: Response) => {
  try {
    const { userId, type } = req.params;
    const categories = await db.category.findMany({
      where: { userId, type: type as "NOTE" | "BOOK" },
      orderBy: { name: "asc" },
    });
    res.status(200).json({ data: categories });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST: Criação
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, userId, type } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ message: "O nome da categoria é obrigatório." });
      return;
    }
    const category = await db.category.create({
      data: { name, userId, type },
    });
    res.status(200).json({ data: category });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({
        message: "Você já possui uma categoria com esse nome.",
      });
      return;
    }
    res.status(400).json({ message: error.message });
  }
};

// PUT: Atualização
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ message: "O nome da categoria é obrigatório." });
      return;
    }
    const category = await db.category.update({
      where: { id },
      data: { name },
    });
    res.status(200).json({ data: category });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({
        message: "Você já possui uma categoria com esse nome e tipo.",
      });
      return;
    }
    res.status(400).json({ message: error.message });
  }
};

// DELETE: Remoção
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await db.category.findUnique({ where: { id } });
    if (category?.name === "Sem categoria") {
      res.status(400).json({
        message: 'A categoria "Sem categoria" não pode ser deletada.',
      });
      return;
    }
    const defaultCategory = await db.category.findFirst({
      where: {
        userId: category.userId,
        name: "Sem categoria",
        type: category.type,
      },
    });
    if (category.type === "NOTE") {
      const notesToMove = await db.note.findMany({
        where: { categoryId: id },
      });
      for (const note of notesToMove) {
        let newTitle = note.title;
        let suffix = 1;
        while (
          await db.note.findFirst({
            where: {
              title: newTitle,
              categoryId: defaultCategory.id,
              userOnBookBookId: note.userOnBookBookId,
            },
          })
        ) {
          newTitle = `${note.title}${suffix}`;
          suffix++;
        }
        await db.note.update({
          where: { id: note.id },
          data: { categoryId: defaultCategory.id, title: newTitle },
        });
      }
    } else if (category.type === "BOOK") {
      const bookCategoryLinks = await db.bookCategoryOnBook.findMany({
        where: { categoryId: id },
      });
      for (const link of bookCategoryLinks) {
        const count = await db.bookCategoryOnBook.count({
          where: {
            userOnBookBookId: link.userOnBookBookId,
            userOnBookUserId: link.userOnBookUserId,
          },
        });

        if (count === 1) {
          await db.bookCategoryOnBook.create({
            data: {
              categoryId: defaultCategory.id,
              userOnBookBookId: link.userOnBookBookId,
              userOnBookUserId: link.userOnBookUserId,
            },
          });
        }
      }
    }
    await db.category.delete({ where: { id } });
    res.status(200).json({
      message: "Categoria deletada com sucesso.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

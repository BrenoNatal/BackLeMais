import { Request, Response } from "express";
import db from "../utils/db";

// GET: Listagem e busca
export const getBookCategoriesOnBook = async (req: Request, res: Response) => {
  try {
    const { bookId, userId } = req.params;
    const categories = await db.bookCategoryOnBook.findMany({
      where: { userOnBookBookId: bookId, userOnBookUserId: userId },
      include: { category: true },
      orderBy: { category: { name: "asc" } },
    });
    res.status(200).json({ data: categories.map((c) => c.category) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST: Criação
export const setBookCategoriesOnBook = async (req: Request, res: Response) => {
  try {
    const { bookId, userId, categoryIds } = req.body;
    const defaultCategory = await db.category.findFirst({
      where: { userId, name: "Sem categoria", type: "BOOK" },
    });
    let finalCategoryIds: string[] = [...categoryIds];
    if (finalCategoryIds.length === 0) {
      finalCategoryIds = [defaultCategory.id];
    } else {
      finalCategoryIds = finalCategoryIds.filter(
        (id) => id !== defaultCategory.id
      );
    }
    await db.bookCategoryOnBook.deleteMany({
      where: { userOnBookBookId: bookId, userOnBookUserId: userId },
    });
    for (const categoryId of finalCategoryIds) {
      await db.bookCategoryOnBook.create({
        data: {
          categoryId,
          userOnBookBookId: bookId,
          userOnBookUserId: userId,
        },
      });
    }
    res.status(200).json({ message: "Categorias atualizadas." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

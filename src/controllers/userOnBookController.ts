import { Request, Response } from "express";
import db from "../utils/db";
import { calculateUserAchievementsService } from "./achievementController";
import { updateUserGoals } from "./userController";
import { updateUserStreak } from "./userStreakController";

// GET: Listagem e busca
export const getUserBooksIds = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const userBooks = await db.userOnBook.findMany({
      where: { userId },
      select: { bookId: true },
    });
    res.status(200).json({ data: userBooks.map((ub) => ub.bookId) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const countUsersOnBook = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const count = await db.userOnBook.count({
      where: { bookId },
    });
    res.status(200).json({ data: count });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserOnBookId = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.bookId;
    const userId = req.params.userId;

    const userOnBook = await db.userOnBook.findUnique({
      where: {
        bookId_userId: {
          bookId: bookId,
          userId: userId,
        },
      },
    });

    res.status(200).json({ data: userOnBook });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUsersOnBooks = async (req: Request, res: Response) => {
  try {
    const userOnBook = await db.userOnBook.findMany();
    res.status(200).json({ data: userOnBook });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST: Criação
export const createUserOnBook = async (req: Request, res: Response) => {
  try {
    const { bookId, userId } = req.body;
    const dbBook = await db.book.findUnique({ where: { id: bookId } });
    let totalPages = undefined;
    if (dbBook && !isNaN(Number(dbBook.numberOfPages))) {
      totalPages = Number(dbBook.numberOfPages);
    }
    const userOnBook = await db.userOnBook.create({
      data: { bookId, userId, totalPages: totalPages || undefined },
    });
    const defaultCategory = await db.category.findFirst({
      where: { userId, name: "Sem categoria", type: "BOOK" },
    });
    await db.bookCategoryOnBook.create({
      data: {
        categoryId: defaultCategory.id,
        userOnBookBookId: bookId,
        userOnBookUserId: userId,
      },
    });
    try {
      await calculateUserAchievementsService(userId);
    } catch (achievementError: any) {
      console.log("Erro ao atualizar conquistas:", achievementError.message);
    }
    res.status(200).json({ data: userOnBook });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT: Atualização
export const updateUserOnBook = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const bookId = req.params.bookId;
    const data = req.body;

    if (data.currentPage < 0) {
      res.status(400).json({ message: "Página não pode ser negativa" });
      return;
    }
    if (data.totalPages !== null && data.totalPages !== undefined) {
      if (data.totalPages <= 0) {
        res.status(400).json({ message: "Total deve ser maior que 0" });
        return;
      }
      if (data.currentPage > data.totalPages) {
        res
          .status(400)
          .json({ message: "Página atual não pode ser maior que o total" });
        return;
      }
    }

    const userOnBookPrev = await db.userOnBook.findUnique({
      where: {
        bookId_userId: {
          bookId: bookId,
          userId: userId,
        },
      },
      select: { bookCategories: true, currentPage: true },
    });

    const userOnBook = await db.userOnBook.update({
      where: {
        bookId_userId: {
          bookId: bookId,
          userId: userId,
        },
      },
      data: data,
    });

    if (
      data.currentPage !== undefined &&
      data.currentPage > userOnBookPrev.currentPage
    ) {
      await updateUserStreak(userId);
    }

    if (data.status == "COMPLETO") {
      updateUserGoals(userId, userOnBookPrev.bookCategories, 1, "BOOKS");
    } else {
      const progress = userOnBook.currentPage - userOnBookPrev.currentPage;
      updateUserGoals(userId, userOnBookPrev.bookCategories, progress, "PAGES");
    }

    // updateUserGoals userId: string, category, progress

    try {
      await calculateUserAchievementsService(userId);
    } catch (achievementError: any) {
      console.log("Erro ao atualizar conquistas:", achievementError.message);
    }
    res.status(200).json({ data: userOnBook });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE: Remoção
export const deleteUserOnBook = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.bookId;
    const userId = req.params.userId;
    await db.userOnBook.delete({
      where: {
        bookId_userId: {
          bookId: bookId,
          userId: userId,
        },
      },
    });
    const count = await db.userOnBook.count({
      where: { bookId },
    });
    if (count === 0) {
      await db.book.delete({
        where: { id: bookId },
      });
    }
    try {
      await calculateUserAchievementsService(userId);
    } catch (achievementError: any) {
      console.log("Erro ao atualizar conquistas:", achievementError.message);
    }
    res.status(200).json({ data: "Relação removida com sucesso." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

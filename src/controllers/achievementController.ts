import { Request, Response } from "express";
import db from "../utils/db";
import { AchievementType } from "../../prisma/app/generated/prisma/client";

export const seedAchievementsService = async () => {
  const defaultAchievements = [
    {
      name: "Leitor Iniciante",
      description: "Leu 100 páginas",
      type: "PAGES_READ",
      threshold: 100,
    },
    {
      name: "Leitor Intermediário",
      description: "Leu 500 páginas",
      type: "PAGES_READ",
      threshold: 500,
    },
    {
      name: "Leitor Avançado",
      description: "Leu 1000 páginas",
      type: "PAGES_READ",
      threshold: 1000,
    },

    {
      name: "Primeiro Livro",
      description: "Completou 1 livro",
      type: "BOOKS_COMPLETED",
      threshold: 1,
    },
    {
      name: "Biblioteca Crescente",
      description: "Completou 5 livros",
      type: "BOOKS_COMPLETED",
      threshold: 5,
    },
    {
      name: "Biblioteca Considerável",
      description: "Completou 10 livros",
      type: "BOOKS_COMPLETED",
      threshold: 10,
    },

    {
      name: "Explorador de Gênero",
      description: "Leu livros de 1 categoria",
      type: "DIVERSE_CATEGORIES",
      threshold: 1,
    },
    {
      name: "Leitor Diversificado",
      description: "Leu livros de 5 categorias diferentes",
      type: "DIVERSE_CATEGORIES",
      threshold: 5,
    },
    {
      name: "Leitor Eclético",
      description: "Leu livros de 10 categorias diferentes",
      type: "DIVERSE_CATEGORIES",
      threshold: 10,
    },

    {
      name: "Primeira Conquista",
      description: "Completou 1 meta",
      type: "GOALS_COMPLETED",
      threshold: 1,
    },
    {
      name: "Determinado",
      description: "Completou 5 metas",
      type: "GOALS_COMPLETED",
      threshold: 5,
    },
    {
      name: "Mestre das Metas",
      description: "Completou 10 metas",
      type: "GOALS_COMPLETED",
      threshold: 10,
    },
    {
      name: "Primeira Semana de Leitura",
      description: "Manteve uma streak de 1 semana (7 dias) de leitura",
      type: "MAX_STREAK_WEEKS",
      threshold: 1,
    },
    {
      name: "Leitor Persistente",
      description: "Manteve uma streak de 5 semanas (35 dias) de leitura",
      type: "MAX_STREAK_WEEKS",
      threshold: 5,
    },
    {
      name: "Lenda da Leitura",
      description: "Manteve uma streak de 10 semanas (70 dias) de leitura",
      type: "MAX_STREAK_WEEKS",
      threshold: 10,
    },
  ];

  for (const achievement of defaultAchievements) {
    await db.achievement.upsert({
      where: {
        type_threshold: {
          type: achievement.type as AchievementType,
          threshold: achievement.threshold,
        },
      },
      update: {
        name: achievement.name,
        description: achievement.description,
      },
      create: {
        name: achievement.name,
        description: achievement.description,
        type: achievement.type as AchievementType,
        threshold: achievement.threshold,
      },
    });
  }
};

const calculatePagesReadAchievementsService = async (userId: string) => {
  const userBooks = await db.userOnBook.findMany({
    where: { userId },
  });

  const totalPagesRead = userBooks.reduce(
    (total, book) => total + book.currentPage,
    0
  );

  const achievements = await db.achievement.findMany({
    where: { type: "PAGES_READ" },
    orderBy: { threshold: "asc" },
  });

  for (const achievement of achievements) {
    const progress = Math.min(totalPagesRead, achievement.threshold);
    const unlocked = totalPagesRead >= achievement.threshold;

    const userAchievement = await db.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    await db.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
      create: {
        userId,
        achievementId: achievement.id,
        progress,
        unlocked,
        unlockedAt: unlocked ? new Date() : null,
      },
      update: {
        progress,
        unlocked,
        unlockedAt:
          unlocked && !userAchievement?.unlocked
            ? new Date()
            : userAchievement?.unlockedAt ?? null,
      },
    });
  }
};

const calculateBooksCompletedAchievementsService = async (userId: string) => {
  const completedBooksCount = await db.userOnBook.count({
    where: {
      userId,
      status: { in: ["COMPLETO", "RELENDO"] },
    },
  });

  const achievements = await db.achievement.findMany({
    where: { type: "BOOKS_COMPLETED" },
    orderBy: { threshold: "asc" },
  });

  for (const achievement of achievements) {
    const progress = Math.min(completedBooksCount, achievement.threshold);
    const unlocked = completedBooksCount >= achievement.threshold;

    const userAchievement = await db.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    await db.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
      create: {
        userId,
        achievementId: achievement.id,
        progress,
        unlocked,
        unlockedAt: unlocked ? new Date() : null,
      },
      update: {
        progress,
        unlocked,
        unlockedAt:
          unlocked && !userAchievement?.unlocked
            ? new Date()
            : userAchievement?.unlockedAt ?? null,
      },
    });
  }
};

const calculateDiverseCategoriesAchievementsService = async (
  userId: string
) => {
  const completedBooks = await db.userOnBook.findMany({
    where: {
      userId,
      status: { in: ["COMPLETO", "RELENDO"] },
    },
    include: {
      bookCategories: {
        include: { category: true },
      },
    },
  });

  const uniqueCategoryIds = new Set<string>();
  completedBooks.forEach((book) => {
    book.bookCategories.forEach((bc) => {
      if (bc.category.name !== "Sem categoria") {
        uniqueCategoryIds.add(bc.categoryId);
      }
    });
  });

  const uniqueCategoriesCount = uniqueCategoryIds.size;

  const achievements = await db.achievement.findMany({
    where: { type: "DIVERSE_CATEGORIES" },
    orderBy: { threshold: "asc" },
  });

  for (const achievement of achievements) {
    const progress = Math.min(uniqueCategoriesCount, achievement.threshold);
    const unlocked = uniqueCategoriesCount >= achievement.threshold;

    const userAchievement = await db.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    await db.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
      create: {
        userId,
        achievementId: achievement.id,
        progress,
        unlocked,
        unlockedAt: unlocked ? new Date() : null,
      },
      update: {
        progress,
        unlocked,
        unlockedAt:
          unlocked && !userAchievement?.unlocked
            ? new Date()
            : userAchievement?.unlockedAt ?? null,
      },
    });
  }
};

const calculateGoalsCompletedAchievementsService = async (userId: string) => {
  const completedGoalsCount = await db.goal.count({
    where: {
      userId,
      status: "COMPLETED",
    },
  });

  const achievements = await db.achievement.findMany({
    where: { type: "GOALS_COMPLETED" },
    orderBy: { threshold: "asc" },
  });

  for (const achievement of achievements) {
    const progress = Math.min(completedGoalsCount, achievement.threshold);
    const unlocked = completedGoalsCount >= achievement.threshold;

    const userAchievement = await db.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    await db.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
      create: {
        userId,
        achievementId: achievement.id,
        progress,
        unlocked,
        unlockedAt: unlocked ? new Date() : null,
      },
      update: {
        progress,
        unlocked,
        unlockedAt:
          unlocked && !userAchievement?.unlocked
            ? new Date()
            : userAchievement?.unlockedAt ?? null,
      },
    });
  }
};

const calculateMaxStreakWeeksAchievementsService = async (userId: string) => {
  const userStreak = await db.userStreak.findUnique({ where: { userId } });
  const maxStreak = userStreak?.max ?? 0;
  const maxWeeks = Math.floor(maxStreak / 7);

  const achievements = await db.achievement.findMany({
    where: { type: "MAX_STREAK_WEEKS" },
    orderBy: { threshold: "asc" },
  });

  for (const achievement of achievements) {
    const progress = Math.min(maxWeeks, achievement.threshold);
    const unlocked = maxWeeks >= achievement.threshold;

    const userAchievement = await db.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    await db.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
      create: {
        userId,
        achievementId: achievement.id,
        progress,
        unlocked,
        unlockedAt: unlocked ? new Date() : null,
      },
      update: {
        progress,
        unlocked,
        unlockedAt:
          unlocked && !userAchievement?.unlocked
            ? new Date()
            : userAchievement?.unlockedAt ?? null,
      },
    });
  }
};

export const calculateUserAchievementsService = async (userId: string) => {
  try {
    await Promise.all([
      calculatePagesReadAchievementsService(userId),
      calculateBooksCompletedAchievementsService(userId),
      calculateDiverseCategoriesAchievementsService(userId),
      calculateGoalsCompletedAchievementsService(userId),
      calculateMaxStreakWeeksAchievementsService(userId),
    ]);
  } catch (error) {
    throw error;
  }
};

export const getUserAchievements = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    await seedAchievementsService();

    await calculateUserAchievementsService(userId);

    const achievements = await db.achievement.findMany({
      include: {
        users: {
          where: { userId },
        },
      },
      orderBy: [{ type: "asc" }, { threshold: "asc" }],
    });

    const groupedAchievements = {};

    achievements.forEach((achievement) => {
      const userProgress = achievement.users[0] || null;

      const formattedAchievement = {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        type: achievement.type,
        threshold: achievement.threshold,
        progress: userProgress ? userProgress.progress : 0,
        unlocked: userProgress ? userProgress.unlocked : false,
      };

      if (!groupedAchievements[achievement.type]) {
        groupedAchievements[achievement.type] = [];
      }

      groupedAchievements[achievement.type].push(formattedAchievement);
    });

    res.status(200).json({ data: groupedAchievements });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const calculateUserAchievements = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.params.userId;
    await calculateUserAchievementsService(userId);
    res.status(200).json({ message: "Conquistas atualizadas com sucesso" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

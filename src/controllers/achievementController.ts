import { Request, Response } from "express";
import db from "../utils/db";
import { AchievementType } from "../../prisma/app/generated/prisma/client";

// Inicializar conquistas padrão
export const seedAchievementsService = async () => {
  const defaultAchievements = [
    // Páginas lidas
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

    // Livros completos
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

    // Categorias diferentes
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

    // Metas concluídas
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
  ];

  for (const achievement of defaultAchievements) {
    const exists = await db.achievement.findFirst({
      where: {
        name: achievement.name,
        type: achievement.type as AchievementType,
      },
    });

    if (!exists) {
      await db.achievement.create({
        data: {
          name: achievement.name,
          description: achievement.description,
          type: achievement.type as AchievementType,
          threshold: achievement.threshold,
        },
      });
    }
  }
};

// Calcular páginas lidas
const calculatePagesReadAchievementsService = async (userId: string) => {
  // Obter todas as relações userOnBook do usuário
  const userBooks = await db.userOnBook.findMany({
    where: { userId },
  });

  // Calcular total de páginas lidas
  const totalPagesRead = userBooks.reduce(
    (total, book) => total + book.currentPage,
    0
  );

  // Buscar conquistas de páginas lidas
  const achievements = await db.achievement.findMany({
    where: { type: "PAGES_READ" },
    orderBy: { threshold: "asc" },
  });

  // Atualizar cada conquista
  for (const achievement of achievements) {
    const userAchievement = await db.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    const progress = Math.min(totalPagesRead, achievement.threshold);
    const unlocked = totalPagesRead >= achievement.threshold;

    if (!userAchievement) {
      await db.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress,
          unlocked,
          unlockedAt: unlocked ? new Date() : null,
        },
      });
    } else if (
      progress !== userAchievement.progress ||
      unlocked !== userAchievement.unlocked
    ) {
      await db.userAchievement.update({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
        data: {
          progress,
          unlocked,
          unlockedAt:
            unlocked && !userAchievement.unlocked
              ? new Date()
              : userAchievement.unlockedAt,
        },
      });
    }
  }
};

// Calcular livros completados
const calculateBooksCompletedAchievementsService = async (userId: string) => {
  const completedBooksCount = await db.userOnBook.count({
    where: {
      userId,
      status: "COMPLETO",
    },
  });

  const achievements = await db.achievement.findMany({
    where: { type: "BOOKS_COMPLETED" },
    orderBy: { threshold: "asc" },
  });

  for (const achievement of achievements) {
    const userAchievement = await db.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    const progress = Math.min(completedBooksCount, achievement.threshold);
    const unlocked = completedBooksCount >= achievement.threshold;

    if (!userAchievement) {
      await db.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress,
          unlocked,
          unlockedAt: unlocked ? new Date() : null,
        },
      });
    } else if (
      progress !== userAchievement.progress ||
      unlocked !== userAchievement.unlocked
    ) {
      await db.userAchievement.update({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
        data: {
          progress,
          unlocked,
          unlockedAt:
            unlocked && !userAchievement.unlocked
              ? new Date()
              : userAchievement.unlockedAt,
        },
      });
    }
  }
};

// Calcular categorias diversas
const calculateDiverseCategoriesAchievementsService = async (
  userId: string
) => {
  // Obter livros completados com suas categorias
  const completedBooks = await db.userOnBook.findMany({
    where: {
      userId,
      status: "COMPLETO",
    },
    include: {
      bookCategories: {
        include: { category: true },
      },
    },
  });

  // Extrair categorias únicas
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
    const userAchievement = await db.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    const progress = Math.min(uniqueCategoriesCount, achievement.threshold);
    const unlocked = uniqueCategoriesCount >= achievement.threshold;

    if (!userAchievement) {
      await db.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress,
          unlocked,
          unlockedAt: unlocked ? new Date() : null,
        },
      });
    } else if (
      progress !== userAchievement.progress ||
      unlocked !== userAchievement.unlocked
    ) {
      await db.userAchievement.update({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
        data: {
          progress,
          unlocked,
          unlockedAt:
            unlocked && !userAchievement.unlocked
              ? new Date()
              : userAchievement.unlockedAt,
        },
      });
    }
  }
};

// Calcular metas concluídas
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
    const userAchievement = await db.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    const progress = Math.min(completedGoalsCount, achievement.threshold);
    const unlocked = completedGoalsCount >= achievement.threshold;

    if (!userAchievement) {
      await db.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress,
          unlocked,
          unlockedAt: unlocked ? new Date() : null,
        },
      });
    } else if (
      progress !== userAchievement.progress ||
      unlocked !== userAchievement.unlocked
    ) {
      await db.userAchievement.update({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
        data: {
          progress,
          unlocked,
          unlockedAt:
            unlocked && !userAchievement.unlocked
              ? new Date()
              : userAchievement.unlockedAt,
        },
      });
    }
  }
};

// Função de serviço
export const calculateUserAchievementsService = async (userId: string) => {
  try {
    await Promise.all([
      calculatePagesReadAchievementsService(userId),
      calculateBooksCompletedAchievementsService(userId),
      calculateDiverseCategoriesAchievementsService(userId),
      calculateGoalsCompletedAchievementsService(userId),
    ]);
  } catch (error) {
    throw error; // Correto para uma função de serviço
  }
};

// Buscar conquistas de um usuário
export const getUserAchievements = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    // Garantir que conquistas padrão existem
    await seedAchievementsService();

    // Calcular conquistas do usuário
    await calculateUserAchievementsService(userId);

    // Buscar conquistas com progresso
    const achievements = await db.achievement.findMany({
      include: {
        users: {
          where: { userId },
        },
      },
      orderBy: {
        type: "asc",
      },
    });

    // Formatar dados para o frontend
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

// Endpoint HTTP para recalcular manualmente
export const calculateUserAchievements = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.params.userId;
    await calculateUserAchievementsService(userId);
    res.status(200).json({ message: "Conquistas atualizadas com sucesso" });
  } catch (error) {
    res.status(400).json({ message: error.message }); // Correto para um endpoint
  }
};

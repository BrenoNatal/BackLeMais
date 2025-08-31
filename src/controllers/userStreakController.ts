import { Request, Response } from "express";
import db from "../utils/db";

function toUTCDateOnly(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export const updateUserStreak = async (userId: string) => {
  const today = toUTCDateOnly(new Date());

  let userStreak = await db.userStreak.findUnique({
    where: { userId },
  });

  if (!userStreak) {
    await db.userStreak.create({
      data: { userId, current: 1, max: 1, completed7: 0, lastReadAt: today },
    });
    return;
  }

  // Já leu hoje? Não faz nada
  if (userStreak.lastReadAt.getTime() === today.getTime()) {
    return;
  }

  // Verifica se leu ontem
  const yesterday = new Date(today);
  yesterday.setUTCDate(today.getUTCDate() - 1);

  let newCurrent = 1;
  let newCompleted7 = 0;

  // Se leu ontem, incrementa
  if (userStreak.lastReadAt.getTime() === yesterday.getTime()) {
    newCurrent = userStreak.current + 1;
    newCompleted7 = userStreak.completed7;
    // Completou 7?
    if (newCurrent > 7) {
      newCurrent = 1;
      newCompleted7 += 1;
    }
  }

  // Atualiza max streak
  const newMax = Math.max(userStreak.max, newCurrent);

  await db.userStreak.update({
    where: { userId },
    data: {
      current: newCurrent,
      max: newMax,
      lastReadAt: today,
      completed7: newCompleted7,
    },
  });
};

export const checkAndResetStreak = async (userId: string) => {
  const today = toUTCDateOnly(new Date());

  const userStreak = await db.userStreak.findUnique({ where: { userId } });
  if (!userStreak) return;

  const diff = Math.floor(
    (today.getTime() - userStreak.lastReadAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff > 1 && userStreak.current !== 0) {
    await db.userStreak.update({
      where: { userId },
      data: { current: 0, completed7: 0 },
    });
  }
};

export const getUserStreak = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    await checkAndResetStreak(userId);
    const userStreak = await db.userStreak.findUnique({
      where: { userId },
    });
    res.status(200).json({
      data: {
        current: userStreak?.current ?? 0,
        completed7: userStreak?.completed7 ?? 0,
        max: userStreak?.max ?? 0,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

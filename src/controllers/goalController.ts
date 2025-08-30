import { group } from "console";
import db from "../utils/db";
import { calculateUserAchievementsService } from "./achievementController";
import { Goal } from "../../prisma/app/generated/prisma/client";

export const updateGoalProgress = async (progress: number, goal: Goal) => {
  const updateProgress = progress + goal.progress;
  //Meta Concluida
  if (updateProgress >= goal.objective) {
    const goalUpdated = await db.goal.update({
      where: { id: goal.id },
      data: { progress: goal.objective, status: "COMPLETED" },
    });
  } else {
    //Meta Não Concluida
    const goalUpdated = await db.goal.update({
      where: { id: goal.id },
      data: { progress: goal.progress + progress },
    });
  }
};

const checkExpirationAllGoals = async () => {
  const now = new Date();
  await db.goal.updateMany({
    where: {
      endsAt: { lt: now },
      status: "ONGOING",
    },
    data: { status: "EXPIRED" },
  });
};

export const getAllGoalsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    await checkExpirationAllGoals();

    if (!userId) {
      throw new Error("Sem Id.");
    }

    const allGoals = await db.goal.findMany({
      where: {
        userId: userId,
      },
      include: { category: true },
    });

    res.status(200).json({ data: allGoals });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getGroupGoalsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    await checkExpirationAllGoals();

    if (!userId) {
      throw new Error("Sem Id.");
    }

    const goals = await db.goal.findMany({
      where: {
        group: {
          users: {
            some: {
              userId: userId,
            },
          },
        },
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
      },
    });

    res.status(200).json({ data: goals });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getAllGoalsByGroupId = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    await checkExpirationAllGoals();

    if (!groupId) {
      throw new Error("Sem Id.");
    }

    const allGoals = await db.goal.findMany({
      where: {
        groupId: groupId,
      },
      include: { category: true },
    });

    allGoals.forEach((goal) => {
      if (goal.endsAt.getDate() > Date.now()) {
        console.log(goal.endsAt);
        console.log(Date.now());
      }
    });

    res.status(200).json({ data: allGoals });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getGoalById = async (req, res) => {
  try {
    const goalId = req.params.id;
    const goal = await db.goal.findUnique({
      where: {
        id: goalId,
      },
      include: { category: true },
    });
    res.status(200).json({ data: goal });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const createGoal = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      objective,
      endsAt,
      userId,
      groupId,
      category,
    } = req.body;

    var goalData;
    if (userId) {
      goalData = {
        name,
        description,
        type,
        objective: Number(objective),
        endsAt: new Date(endsAt),
        user: {
          connect: { id: userId },
        },
        category: {
          connect: category.map((cat) => ({ id: cat.id })),
        },
      };
    } else {
      goalData = {
        name,
        description,
        type,
        objective: Number(objective),
        endsAt: new Date(endsAt),
        group: {
          connect: { id: groupId },
        },
      };
    }

    const goal = await db.goal.create({
      data: goalData,
    });
    res.status(200).json({ data: goal });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    const goalData = req.body;

    const goal = await db.goal.update({
      where: {
        id: goalId,
      },
      data: goalData,
    });

    if (goalData.status === "COMPLETED" && goal.userId) {
      try {
        await calculateUserAchievementsService(goal.userId);
      } catch (achievementError: any) {
        console.log("Erro ao atualizar conquistas:", achievementError.message);
      }
    }

    res.status(200).json({ data: goal });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    const goal = await db.goal.delete({
      where: {
        id: goalId,
      },
    });

    res.status(200).json({ data: {} });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

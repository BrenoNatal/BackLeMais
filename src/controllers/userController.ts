import { hashSync } from "bcryptjs";
import db from "../utils/db";
import { generateToken } from "../utils/jwt";
import {
  calculateUserAchievementsService,
  seedAchievementsService,
} from "./achievementController";
import {
  BookCategoryOnBook,
  TypeGoal,
} from "../../prisma/app/generated/prisma/client";
import { updateGoalProgress } from "./goalController";
import { supabase } from "../utils/supabase";

export const updateUserGoals = async (
  userId: string,
  bookCategories: BookCategoryOnBook[],
  progress: number,
  goalType: TypeGoal
) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { goals: { include: { category: true } } },
  });

  user.goals.forEach(async (goal) => {
    const intersection = goal.category.filter((cat) =>
      bookCategories.filter((bookCat) => bookCat.categoryId === cat.id)
    );

    if (
      (intersection.length > 0 || goal.category.length == 0) &&
      goal.type == goalType
    ) {
      updateGoalProgress(progress, goal);
    }
  });
};

export const findUserByEmail = (email) => {
  return db.user.findUnique({
    where: {
      email,
    },
  });
};

export const findUserById = (userId) => {
  return db.user.findUnique({
    where: {
      id: userId,
    },
  });
};

export const register = async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.email?.trim() || !userData.password?.trim()) {
      res.status(400);
      throw new Error("Precisa de email e senha.");
    }

    userData.password = hashSync(userData.password, 12);

    const user = await db.user.create({
      data: userData,
    });

    await db.category.createMany({
      data: [
        { name: "Sem categoria", userId: user.id, type: "NOTE" },
        { name: "Sem categoria", userId: user.id, type: "BOOK" },
      ],
    });

    try {
      await seedAchievementsService();
      await calculateUserAchievementsService(user.id);
    } catch (achievementError: any) {
      console.log("Erro ao inicializar conquistas:", achievementError.message);
    }

    const token = generateToken(user);

    res.status(200).json({
      token: token,
      userId: user.id,
      name: user.name,
    });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const name = req.query.name;

    const allUsers = await db.user.findMany({
      where: {
        name: { contains: name, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        profileImageUrl: true,
      },
    });

    res.status(200).json({ data: allUsers });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: { name: true },
    });
    res.status(200).json({ data: user });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getUserByIdAuth = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        books: { include: { book: {} } },
        friends: {
          include: { friendOf: {} },
        },
      },
    });
    res.status(200).json({ data: user });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        groups: { include: { group: true } },
      },
    });
    res.status(200).json({ data: user });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;

    const user = await db.user.update({
      where: {
        id: userId,
      },
      data: userData,
    });
    res.status(200).json({ data: user });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({ message: "Usuario deletado com sucesso." });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const updateUserImage = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!req.file)
      return res.status(400).json({ error: "Nenhuma imagem enviada" });

    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `profiles/${userId}.jpg`;
    const filePath = `profile-images/${fileName}`;

    // Upload para o Supabase Storage
    const { error } = await supabase.storage
      .from("profile-images") // nome do bucket
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    // Gera URL pública (se bucket for público)
    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath);

    console.log("Updload de image");
    // Atualiza no banco
    const user = await db.user.update({
      where: { id: userId },
      data: { profileImageUrl: data.publicUrl },
    });

    res.json({ success: true, imageUrl: data.publicUrl, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao fazer upload" });
  }
};

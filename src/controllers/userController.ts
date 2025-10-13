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
import { sendVerificationEmail } from "../services/emailService";
import { v4 as uuidv4 } from "uuid";
import { group } from "console";

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

export const updateUserGroupGoals = async (
  userId: string,
  bookCategories: BookCategoryOnBook[],
  progress: number,
  goalType: TypeGoal
) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      groups: {
        include: {
          group: { include: { goals: { include: { category: true } } } },
        },
        where: {
          type: { not: "PENDING" },
        },
      },
    },
  });

  console.log("Metas Grupos Usuario: ", user);

  user.groups.forEach(async (group) => {
    const userOnGroup = await db.userOnGroup.findUnique({
      where: {
        groupId_userId: {
          groupId: group.groupId,
          userId: userId,
        },
      },
    });
    group.group.goals.forEach(async (goal) => {
      const intersection = goal.category.filter((cat) =>
        bookCategories.filter((bookCat) => bookCat.categoryId === cat.id)
      );

      if (
        (intersection.length > 0 || goal.category.length == 0) &&
        goal.type == goalType
      ) {
        updateGoalProgress(progress, goal);
        switch (goal.type) {
          case "BOOKS":
            await db.userOnGroup.update({
              where: {
                groupId_userId: {
                  groupId: userOnGroup.groupId,
                  userId: userOnGroup.userId,
                },
              },
              data: {
                pointsAccumulatedBooks:
                  userOnGroup.pointsAccumulatedBooks + progress,
              },
            });
            break;
          case "PAGES":
            await db.userOnGroup.update({
              where: {
                groupId_userId: {
                  groupId: userOnGroup.groupId,
                  userId: userOnGroup.userId,
                },
              },
              data: {
                pointsAccumulatedPages:
                  userOnGroup.pointsAccumulatedPages + progress,
              },
            });
            break;
          default:
            break;
        }
      }
    });
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
    const { email, password, username, name } = req.body;

    if (
      !email?.trim() ||
      !password?.trim() ||
      !username?.trim() ||
      !name?.trim()
    ) {
      return res
        .status(400)
        .json({ message: "Precisa de email, senha, nome e username." });
    }

    const redirectUrl = `${process.env.APP_URL}/auth/verify-email`;

    // 1. Cria usuário no Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (authError) {
      console.error("Erro Supabase:", authError.message);
      return res.status(400).json({ message: authError.message });
    }

    const supabaseUser = authData.user;
    if (!supabaseUser) {
      return res
        .status(400)
        .json({ message: "Erro ao criar usuário no Supabase." });
    }

    // 2. Salva dados complementares no Prisma
    const user = await db.user.create({
      data: {
        id: supabaseUser.id, // mantém o mesmo UUID do Supabase
        email,
        name,
        username,
        password: "managed-by-supabase", // campo apenas para compatibilidade
        isVerified: false, // será true no webhook ou login
      },
    });

    // 3. Cria categorias padrão
    await db.category.createMany({
      data: [
        { name: "Sem categoria", userId: user.id, type: "NOTE" },
        { name: "Sem categoria", userId: user.id, type: "BOOK" },
      ],
    });

    // 4. Inicializa conquistas
    try {
      await seedAchievementsService();
      await calculateUserAchievementsService(user.id);
    } catch (err: any) {
      console.log("Erro ao inicializar conquistas:", err.message);
    }

    return res.status(200).json({
      message: "Usuário registrado. Verifique seu e-mail para ativar a conta.",
    });
  } catch (error: any) {
    console.error("Erro no registro:", error.message);
    return res.status(400).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const name = req.query.name;

    const allUsers = await db.user.findMany({
      where: {
        name: { contains: name, mode: "insensitive" },
        isVerified: { equals: true },
      },
      select: {
        id: true,
        name: true,
        profileImageUrl: true,
        username: true,
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
      select: { name: true, username: true },
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
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        profileImageUrl: true,
        books: {
          where: { status: { equals: "LENDO" } },
          include: { book: {} },
          orderBy: { updatedAt: "desc" },
        },
        friends: {
          include: { friendOf: {} },
        },
        friendOf: {
          include: { user: {} },
        },
        achievements: {
          where: { unlocked: true },
          include: {
            achievement: true,
          },
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

    console.log(userId);
    console.log(userData);

    // Buscar o usuário atual
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Combinar dados novos com os antigos
    const updatedData = { ...existingUser, ...userData };

    const user = await db.user.update({
      where: { id: userId },
      data: updatedData,
    });

    res.status(200).json({ message: "Perfil Editado Com Sucesso", data: user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedRecords = db.$transaction(async (prisma) => {
      // Captura instâncias deletadas
      const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
      });
      const categoriesToDelete = await prisma.category.findMany({
        where: { userId },
      });
      const achievementsToDelete = await prisma.userAchievement.findMany({
        where: { userId },
      });
      const friendshipsToDelete = await prisma.friendship.findMany({
        where: { OR: [{ friendId: userId }, { userId: userId }] },
      });
      const postsToDelete = await prisma.post.findMany({ where: { userId } });
      const goalsToDelete = await prisma.goal.findMany({ where: { userId } });
      const userStreakToDelete = await prisma.userStreak.findUnique({
        where: { userId },
      });
      const userOnGroupsDeleted = await prisma.userOnGroup.findMany({
        where: { userId },
      });

      // Livros e UserOnBook
      const userBooks = await prisma.userOnBook.findMany({
        where: { userId },
        select: { bookId: true },
      });
      const bookIds = userBooks.map((b) => b.bookId);
      let booksToDelete = [];

      if (bookIds.length > 0) {
        const booksWithCounts = await prisma.userOnBook.groupBy({
          by: ["bookId"],
          where: { bookId: { in: bookIds } },
          _count: { userId: true },
        });
        booksToDelete = booksWithCounts
          .filter((b) => b._count.userId === 1)
          .map((b) => b.bookId);
      }

      const booksDeleted = await prisma.book.findMany({
        where: { id: { in: booksToDelete } },
      });
      const userOnBooksDeleted = await prisma.userOnBook.findMany({
        where: { userId },
      });

      // Deletar na ordem correta
      await prisma.userOnBook.deleteMany({ where: { userId } });
      await prisma.book.deleteMany({ where: { id: { in: booksToDelete } } });
      await prisma.category.deleteMany({ where: { userId } });
      await prisma.userAchievement.deleteMany({ where: { userId } });
      await prisma.friendship.deleteMany({
        where: { OR: [{ friendId: userId }, { userId: userId }] },
      });
      await prisma.post.deleteMany({ where: { userId } });
      await prisma.goal.deleteMany({ where: { userId } });
      if (userStreakToDelete)
        await prisma.userStreak.delete({ where: { userId } });
      await prisma.userOnGroup.deleteMany({ where: { userId } }); // <--- Corrigido
      await prisma.user.delete({ where: { id: userId } });

      // Retornar instâncias deletadas
      return {
        user: userToDelete,
        categories: categoriesToDelete,
        achievements: achievementsToDelete,
        friendships: friendshipsToDelete,
        posts: postsToDelete,
        goals: goalsToDelete,
        streak: userStreakToDelete,
        userOnGroups: userOnGroupsDeleted,
        userOnBooks: userOnBooksDeleted,
        books: booksDeleted,
      };
    });

    res.status(200).json({
      message: "Usuario deletado com sucesso.",
      deletedRecords,
    });
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

    // Busca usuário atual para pegar imagem antiga
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { profileImageUrl: true },
    });

    // Se existir imagem antiga, deleta do bucket
    if (currentUser?.profileImageUrl) {
      try {
        // Extrai o caminho relativo no bucket a partir da URL
        const oldPath =
          currentUser.profileImageUrl.split("/profile-images/")[1];
        if (oldPath) {
          const { error: deleteError } = await supabase.storage
            .from("profile-images")
            .remove([oldPath]);
          if (deleteError)
            console.warn("Erro ao deletar imagem antiga:", deleteError.message);
        }
      } catch (e) {
        console.warn("Erro ao tentar remover imagem antiga:", e.message);
      }
    }

    // Monta novo nome com timestamp
    const fileExt = req.file.originalname.split(".").pop();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `profile-images/profiles/${userId}_${timestamp}.${fileExt}`;
    const filePath = `${fileName}`;

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

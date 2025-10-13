import { Request, Response } from "express";
import db from "../utils/db";
import { supabase } from "../utils/supabase";
import { Prisma } from "../../prisma/app/generated/prisma/client";

export const createGroup = async (req, res) => {
  try {
    const groupData = req.body;

    const groupCreatorId = groupData.userId;

    const existingGroup = await db.group.findUnique({
      where: { name: groupData.name },
    });

    if (existingGroup) {
      res.status(400);
      throw new Error("Nome de grupo já utilizado.");
    }

    const group = await db.group.create({
      data: {
        name: groupData.name,
        description: groupData.description,
      },
    });

    const creatorOfGroup = await db.userOnGroup.create({
      data: {
        userId: groupCreatorId,
        groupId: group.id,
        type: "CREATOR",
      },
    });

    res.status(200).json({ data: { group, creatorOfGroup } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2000":
          return res.status(400).json({
            message:
              "Um dos campos enviados ultrapassa o tamanho máximo permitido.",
          });
        case "P2002":
          return res.status(409).json({
            message: `Já existe um registro com o mesmo valor para o campo único "${error.meta?.target}".`,
          });
        case "P2025":
          return res.status(404).json({
            message: "Registro não encontrado para atualização ou exclusão.",
          });
        default:
          return res.status(400).json({
            message: `Erro no banco de dados (código ${error.code}).`,
          });
      }
    }

    // Outros erros genéricos
    if (error.message) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Erro interno ao criar o grupo." });
    }
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const groupName = req.query.name;

    const groups = await db.group.findMany({
      where: {
        name: { contains: groupName, mode: "insensitive" },
      },
    });

    res.status(200).json({ data: groups });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.id;

    const group = await db.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        goals: true,
        users: {
          select: {
            type: true,
            pointsAccumulatedBooks: true,
            pointsAccumulatedPages: true,
            user: {
              select: {
                id: true,
                name: true,
                profileImageUrl: true,
                username: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({ data: group });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getGroupRanksById = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.id;

    const group = await db.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        users: {
          select: {
            type: true,
            pointsAccumulatedBooks: true,
            pointsAccumulatedPages: true,
            user: {
              select: {
                id: true,
                name: true,
                profileImageUrl: true,
                username: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({ data: group });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID do grupo é obrigatório." });
    }

    // Verifica se o grupo existe
    const existingGroup = await db.group.findUnique({
      where: { id: id },
    });

    if (!existingGroup) {
      return res.status(404).json({ message: "Grupo não encontrado." });
    }

    // Verifica se o novo nome já está sendo usado por outro grupo
    if (name && name !== existingGroup.name) {
      const duplicateGroup = await db.group.findUnique({
        where: { name },
      });

      if (duplicateGroup) {
        return res.status(400).json({ message: "Nome de grupo já utilizado." });
      }
    }

    // Atualiza o grupo
    const updatedGroup = await db.group.update({
      where: { id: id },
      data: {
        name,
        description,
      },
    });

    return res.status(200).json({
      message: "Grupo atualizado com sucesso.",
      data: updatedGroup,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2000":
          return res.status(400).json({
            message:
              "Um dos campos enviados ultrapassa o tamanho máximo permitido.",
          });
        case "P2002":
          return res.status(409).json({
            message: `Já existe um registro com o mesmo valor para o campo único "${error.meta?.target}".`,
          });
        case "P2025":
          return res.status(404).json({
            message: "Registro não encontrado para atualização.",
          });
        default:
          return res.status(400).json({
            message: `Erro no banco de dados (código ${error.code}).`,
          });
      }
    }

    console.error("Erro ao atualizar grupo:", error);
    return res.status(500).json({
      message: error.message || "Erro interno ao atualizar o grupo.",
    });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.payload.userId;

    const group = await db.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        users: {
          where: {
            type: { equals: "CREATOR" },
          },
        },
      },
    });

    if (group.users[0].userId != userId) {
      throw new Error("Usuario sem autorização para realizar essa operação.");
    }

    await db.group.delete({
      where: {
        id: groupId,
      },
    });

    res.status(200).json({ message: "Grupo deletado com sucesso." });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const updateGroupImage = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!req.file)
      return res.status(400).json({ error: "Nenhuma imagem enviada" });

    // Busca grupo atual para pegar imagem antiga
    const currentGroup = await db.group.findUnique({
      where: { id: groupId },
      select: { groupImageUrl: true },
    });

    // Se existir imagem antiga, deleta do bucket
    if (currentGroup?.groupImageUrl) {
      try {
        // Extrai o caminho relativo no bucket a partir da URL
        const oldPath = currentGroup.groupImageUrl.split("/group-images/")[1];
        if (oldPath) {
          const { error: deleteError } = await supabase.storage
            .from("group-images")
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
    const fileName = `group-images/groups/${groupId}_${timestamp}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload para o Supabase Storage
    const { error } = await supabase.storage
      .from("group-images") // nome do bucket
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    // Gera URL pública (se bucket for público)
    const { data } = supabase.storage
      .from("group-images")
      .getPublicUrl(filePath);

    console.log("Updload de image");
    // Atualiza no banco
    const group = await db.group.update({
      where: { id: groupId },
      data: { groupImageUrl: data.publicUrl },
    });

    res.json({ success: true, imageUrl: data.publicUrl, group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao fazer upload" });
  }
};

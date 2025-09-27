import { Request, Response } from "express";
import db from "../utils/db";
import { supabase } from "../utils/supabase";

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
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
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
    const groupId = req.params.id;
    const groupData = req.body;

    const group = await db.group.update({
      where: {
        id: groupId,
      },
      data: groupData,
    });
    res.status(200).json({ data: group });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await db.group.delete({
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

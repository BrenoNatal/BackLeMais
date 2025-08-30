import { Request, Response } from "express";
import db from "../utils/db";
import { supabase } from "../utils/supabase";

export const createGroup = async (req, res) => {
  try {
    const groupData = req.body;

    const groupCreatorId = groupData.userId;

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
            user: { select: { id: true, name: true, profileImageUrl: true } },
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

    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `groups/${groupId}.jpg`;
    const filePath = `group-images/${fileName}`;

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

import { Request, Response } from "express";
import db from "../utils/db";

export const createGroup = async (req, res) => {
  try {
    const groupData = req.body;

    const group = await db.group.create({
      data: groupData,
    });

    res.status(200).json({ data: group });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getGroups = async (req: Request, res: Response) => {
  try {
    const groupData = req.body;

    const groups = await db.group.findMany({
      where: {
        name: { contains: groupData.name },
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

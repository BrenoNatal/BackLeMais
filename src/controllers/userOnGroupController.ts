import { Request, Response } from "express";
import db from "../utils/db";

export const createUserOnGroup = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const userOnGroup = await db.userOnGroup.create({
      data: {
        userId: data.userId,
        groupId: data.groupId,
        type: "MEMBER",
      },
    });

    res.status(200).json({ data: userOnGroup });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getUserOnGroup = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const userOnGroups = await db.userOnGroup.findMany();

    res.status(200).json({ data: userOnGroups });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getUserOnGroupById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;

    const userOnGroup = await db.userOnGroup.findUnique({
      where: {
        groupId_userId: {
          groupId: groupId,
          userId: userId,
        },
      },
    });

    res.status(200).json({ data: userOnGroup });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const updateUserOnGroup = async (req, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    const data = req.body;

    const group = await db.userOnGroup.update({
      where: {
        groupId_userId: {
          groupId: groupId,
          userId: userId,
        },
      },
      data: data,
    });

    res.status(200).json({ data: group });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const deleteUserOnGroup = async (req, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    const userOnGroup = await db.userOnGroup.delete({
      where: {
        groupId_userId: {
          groupId: groupId,
          userId: userId,
        },
      },
    });

    res
      .status(200)
      .json({ message: "Relação com grupo deletada com sucesso." });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

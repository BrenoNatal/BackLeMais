import { Request, Response } from "express";
import db from "../utils/db";
import { group } from "console";

export const createPost = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log(data);

    const userOnGroup = await db.userOnGroup.findUnique({
      where: {
        groupId_userId: {
          groupId: data.groupId,
          userId: data.userId,
        },
      },
    });

    if (userOnGroup.type == "PENDING") {
      throw new Error(
        "Participação no grupo ainda pendente, aguarde ser aceito para postar no grupo."
      );
    }

    const post = await db.post.create({
      data: data,
    });

    res.status(200).json({ data: post });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getPostByGroupId = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.id;

    const posts = await db.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        posts: {
          include: {
            user: {
              select: {
                name: true,
                id: true,
                profileImageUrl: true,
                username: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({ data: posts });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

import { Request, Response } from "express";
import db from "../utils/db";

export const createUserOnBook = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const userOnBook = await db.usersOnBooks.create({
      data: data,
    });

    res.status(200).json({ data: userOnBook });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getUserOnBook = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const userOnBook = await db.usersOnBooks.findMany();

    res.status(200).json({ data: userOnBook });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getUserOnBookId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const bookId = req.params.bookId;

    const userOnBook = await db.usersOnBooks.findUnique({
      where: {
        bookId_userId: {
          bookId: bookId,
          userId: userId,
        },
      },
    });

    res.status(200).json({ data: userOnBook });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const updateUserOnBook = async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookId = req.params.bookId;
    const data = req.body;

    const group = await db.usersOnBooks.update({
      where: {
        bookId_userId: {
          bookId: bookId,
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

export const deleteUserOnBook = async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookId = req.params.bookId;
    const userOnBook = await db.usersOnBooks.delete({
      where: {
        bookId_userId: {
          bookId: bookId,
          userId: userId,
        },
      },
    });

    res
      .status(200)
      .json({ message: "Relação com livro deletada com sucesso." });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

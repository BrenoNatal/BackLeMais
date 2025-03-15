import { Request, Response } from "express";
import db from "../utils/db";

export const getAllBooks = async (req, res) => {
  try {
    const allBooks = await db.book.findMany();

    res.status(200).json({ data: allBooks });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await db.book.findUnique({
      where: {
        id: bookId,
      },
    });
    res.status(200).json({ data: book });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const bookData = req.body;

    const book = await db.book.create({
      data: bookData,
    });
    res.status(200).json({ data: book });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
    const bookData = req.body;
    const bookId = req.params.id;

    const book = await db.book.update({
      where: {
        id: bookId,
      },
      data: bookData,
    });
    res.status(200).json({ data: book });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id;

    const book = await db.book.delete({
      where: {
        id: bookId,
      },
    });

    res.status(200).json({ message: "Livro deletado com sucesso." });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

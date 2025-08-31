import { Request, Response } from "express";
import db from "../utils/db";

// GET: Listagem e busca
export const getDBBookByOLId = async (req: Request, res: Response) => {
  try {
    const olWorkId = req.query.olWorkId as string;
    const olBookId = req.query.olBookId as string | undefined;
    const book = await db.book.findFirst({
      where: {
        olWorkId,
        olBookId: olBookId ?? undefined,
      },
    });
    res.status(200).json({ data: book });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id;
    const book = await db.book.findUnique({
      where: {
        id: bookId,
      },
    });
    res.status(200).json({ data: book });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const allBooks = await db.book.findMany();

    res.status(200).json({ data: allBooks });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST: Criação
export const getUserBooksByIds = async (req: Request, res: Response) => {
  try {
    const { bookIds, userId } = req.body;
    const books = await db.book.findMany({
      where: { id: { in: bookIds } },
      include: {
        users: {
          where: { userId },
          include: {
            bookCategories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
    const booksWithCategories = books.map((book) => {
      const userOnBook = book.users[0];
      return {
        ...book,
        bookCategories: userOnBook.bookCategories.map((bc) => bc.category),
        status: userOnBook.status,
      };
    });
    res.status(200).json({ data: booksWithCategories });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createBook = async (req, res) => {
  try {
    const bookData = req.body;

    const book = await db.book.create({
      data: bookData,
    });

    res.status(200).json({ data: book });
  } catch (error) {
    const err = error.message;
    res.status(400).json({ message: err });
  }
};

// PUT: Atualização
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
    res.status(400).json({ message: error.message });
  }
};

// DELETE: Remoção
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id;

    await db.book.delete({
      where: {
        id: bookId,
      },
    });

    res.status(200).json({ data: "Livro deletado com sucesso." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

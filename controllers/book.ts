import { Request, Response } from "express";
import db from "../db/db";
import { body, param, validationResult } from "express-validator";

export type Book = {
  BookId: number;
  BookName: string;
  IsActive: number;
  Quantity: number;
};

export type BookWithAverage = {
  BookId: number;
  BookName: string;
  score: number;
};

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const books: Book[] = await db("books").select("BookId", "BookName");
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

export const createBook = [
  body("name").notEmpty().withMessage("Name is required").isString(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const { name } = req.body;

        await db("books").insert({
          BookName: name,
          IsActive: 1,
          Quantity: 1,
        });

        res.status(201).json({
          response: "Successfully Created",
        });
      } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      }
    } else res.status(400).json({ errors: errors.array() });
  },
];

export const getBookAverage = [
  param("id").isInt().withMessage("Book ID must be an integer"),
  async (req: Request<{ id: string }>, res: Response) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const { id } = req.params;

        const booksWithAverage: BookWithAverage[] = await db("books")
          .join("UserBooks", "books.BookId", "UserBooks.BookId")
          .where("books.BookId", id)
          .andWhere("UserBooks.IsReturned", 1)
          .groupBy("books.BookId", "books.BookName")
          .select("books.BookId", "books.BookName")
          .avg("UserBooks.Score as score");

        if (booksWithAverage.length === 0) {
          const book = await db("books")
            .where("BookId", id)
            .select("BookName")
            .first();
          const noScore = {
            id: id,
            name: book?.BookName || "Unknown",
            score: -1,
          };
          res.json(noScore);
        } else {
          res.json(booksWithAverage[0]);
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      }
    } else res.status(400).json({ errors: errors.array() });
  },
];

export const borrowBook = [
  param("id").isInt().withMessage("User ID must be an integer"),
  param("bookId").isInt().withMessage("Book ID must be an integer"),
  async (req: Request<{ id: string; bookId: string }>, res: Response) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const { id, bookId } = req.params;

        const result = await db("Books")
          .where("BookId", bookId)
          .andWhere("Quantity", ">", 0)
          .update({ Quantity: 0 });

        if (result !== 0) {
          await db("UserBooks").insert({
            UserId: id,
            BookId: bookId,
            PurchaseDate: new Date(),
            IsReturned: 0,
            Score: 0,
          });

          res.status(201).json({
            response: "Successfully Borrowed",
          });
        } else {
          res.status(406).json({
            response: "The Book is out of stock",
          });
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      }
    } else res.status(400).json({ errors: errors.array() });
  },
];

export const returnBook = [
  param("id").isInt().withMessage("User ID must be an integer"),
  param("bookId").isInt().withMessage("Book ID must be an integer"),
  body("score")
    .isInt({ min: 0, max: 10 })
    .withMessage("Score must be between 0 and 10"),
  async (
    req: Request<{ id: string; bookId: string }, {}, { score: number }>,
    res: Response
  ) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const { id, bookId } = req.params;
        const { score } = req.body;

        const result = await db("Books")
          .where("BookId", bookId)
          .andWhere("Quantity", "=", 0)
          .update({ Quantity: 1 });

        if (result !== 0) {
          await db("UserBooks")
            .where("BookId", bookId)
            .andWhere("UserId", id)
            .whereNull("ReturnDate")
            .update({ Score: score, ReturnDate: new Date(), IsReturned: 1 });

          res.status(201).json({
            response: "Successfully Returned",
          });
        } else {
          res.status(406).json({
            response: "The Book cannot be returned",
          });
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      }
    } else res.status(400).json({ errors: errors.array() });
  },
];

export default getAllBooks;

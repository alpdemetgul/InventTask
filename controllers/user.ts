import { Request, Response } from "express";
import {
  body,
  ValidationError,
  validationResult,
  param,
} from "express-validator";
import db from "../db/db";

// Type definitions for the data structures
export type User = {
  UserId: number;
  Name: string;
};

export type PastBook = {
  bookName: string;
  Score: number;
};

export type PresentBook = {
  bookName: string;
};

export type GetAllUsersResponse = User[];

export type GetUserByIdResponse = {
  id: number;
  name: string;
  books: {
    past: PastBook[];
    present: PresentBook[];
  };
};

export type CreateUserRequestBody = {
  name: string;
};

export type CreateUserResponse = {
  response: string;
};
export type CreateErrorResponse = {
  errors: ValidationError[];
};

export const getAllUsers = async (
  req: Request,
  res: Response<GetAllUsersResponse | string>
) => {
  try {
    const users = await db("users").select<User[]>("UserId", "Name");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

export const getUserById = [
  param("id").isNumeric().withMessage("User ID must be a valid number"),

  async (
    req: Request<{ id: string }>,
    res: Response<GetUserByIdResponse | CreateErrorResponse | string>
  ) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const { id } = req.params;

        const user = await db("users")
          .select<User>("UserId", "Name")
          .where("UserId", id)
          .first();

        if (!user) {
          return res.status(404).json("User not found");
        }

        const past = await db("books")
          .join("UserBooks", "books.BookId", "UserBooks.BookId")
          .andWhere("UserBooks.UserId", user.UserId)
          .where("UserBooks.IsReturned", 1)
          .select<PastBook[]>("books.bookName", "UserBooks.Score");

        const present = await db("books")
          .join("UserBooks", "books.BookId", "UserBooks.BookId")
          .andWhere("UserBooks.UserId", user.UserId)
          .where("UserBooks.IsReturned", 0)
          .select<PresentBook[]>("books.bookName");

        const resp: GetUserByIdResponse = {
          id: user.UserId,
          name: user.Name,
          books: {
            past,
            present,
          },
        };

        res.json(resp);
      } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      }
    } else res.status(400).json({ errors: errors.array() });
  },
];

export const createUser = [
  body("name").notEmpty().withMessage("Name is required").isString(),

  // Request handler
  async (
    req: Request<{}, {}, CreateUserRequestBody>,
    res: Response<CreateUserResponse | string | CreateErrorResponse>
  ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      try {
        const { name } = req.body;

        await db("users").insert({
          Name: name,
          IsActive: 1,
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

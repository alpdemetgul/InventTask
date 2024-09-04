const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const bookController = require("../controllers/book");

router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.post("/users", userController.createUser);

router.get("/books", bookController.getAllBooks);
router.post("/books", bookController.createBook);
router.get("/books/:id", bookController.getBookAverage);
router.post("/users/:id/borrow/:bookId", bookController.borrowBook);
router.post("/users/:id/return/:bookId", bookController.returnBook);

module.exports = router;

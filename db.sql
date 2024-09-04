CREATE TABLE Users(
UserId int IDENTITY(101, 1) PRIMARY KEY NOT NULL, 
Name varchar(55),
IsActive bit NOT NULL
);
CREATE TABLE Books(
BookId int IDENTITY(1, 1) PRIMARY KEY NOT NULL, 
BookName varchar(55),
Quantity int NOT NULL,
IsActive bit NOT NULL
);

CREATE TABLE UserBooks(
UserBookId int IDENTITY(1, 1) PRIMARY KEY NOT NULL, 
UserId int   FOREIGN KEY REFERENCES Users(UserId) NOT NULL, 
BookId int   FOREIGN KEY REFERENCES Books(BookId) NOT NULL,
PurchaseDate DATETIME,
ReturnDate DATETIME null,
IsReturned bit default 0,
Score int default -1
);
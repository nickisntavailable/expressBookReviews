const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
   const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
        message: 'Username and password are required'
    });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign(
        {
            username
        },
        "access",
        {
            expiresIn: 60 * 60
        }
    );
    req.session.authorization = {
        accessToken,
        username
    };
    return res.status(200).json({
        message: 'Username successfully logged in'
    });
  }

  return res.status(403).json({
    message: 'Invalid login. Check username and password'
});
    //   return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({
        message: 'Book not found.'
    });
  }

  books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: 'Review posted.'
    });
//   return res.status(300).json({message: "Yet to be implemented"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({
            message: 'Book not found.'
        });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({
            message: 'Review not found.'
        });
    }

    delete books[isbn].reviews[username];
    return res.status(200).json({
        message: 'Review deleted.'
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const token = req.cookies["accesstoken"];

  if (!token) {
    return res.status(401).json("No token provided. You are not logged in.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Optionally store the decoded user info in the request object
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json("Invalid token. Please log in again.");
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json("Token expired. Please log in again.");
    }
    res.status(500).json("An error occurred while authenticating.");
  }
};

module.exports = authMiddleware;
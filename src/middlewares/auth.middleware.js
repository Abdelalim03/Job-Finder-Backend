const jwt = require("jsonwebtoken");
const prisma = require("../models/prismaClient");
const { JWT_SECRET, exclude } = require("../configs");
const { StatusCodes } = require("http-status-codes");

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user;
    if (decoded.role === "tasker") {
      user = await prisma.tasker.findUnique({
        where: {
          id: decoded.userID,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          amount: true,
          description: true,
          profilePicture: true,
          Task: {
            select: {
              _count,
            },
          },
        },
      });
      user.role = "tasker";
    } else if (decoded.role === "client") {
      user = await prisma.client.findUnique({
        where: {
          id: decoded.userID,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });
      user.role = "client";
    } else if (decoded.role === "user") {
      user = await prisma.user.findUnique({
        where: {
          id: decoded.userID,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });
      user.role = "user";
    }

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticateToken;

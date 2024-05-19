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
      const tasker = await prisma.tasker.findUnique({
        where: {
          userId: decoded.userID,
        },
        select: {
          User: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
          profilePicture:true,
          Task: {
            select: {
              _count: true,
            },
          },
        },
      });

      if (tasker) {
        user = {
          id: tasker.User.id,
          email: tasker.User.email,
          firstName: tasker.User.firstName,
          lastName: tasker.User.lastName,
          phoneNumber: tasker.User.phoneNumber,
          role: "tasker",
          taskCount: tasker.Task._count,
          profilePicture:tasker.profilePicture
        };
      }
    } else if (decoded.role === "client") {
      const client = await prisma.client.findUnique({
        where: {
          userId: decoded.userID,
        },
        include: {
          User: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (client) {
        user = {
          id: client.User.id,
          email: client.User.email,
          firstName: client.User.firstName,
          lastName: client.User.lastName,
          role: "client",
        };
      }
    } else if (decoded.role === "user") {
      const userData = await prisma.user.findUnique({
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

      if (userData) {
        user = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: "user",
        };
      }
    } else if (decoded.role === "admin") {
      const admin = await prisma.admin.findUnique({
        where: {
          id: decoded.adminID,
        },
        select: {
          id: true,
          email: true,
        },
      });

      if (admin) {
        user = {
          id: admin.id,
          email: admin.email,
          role: "admin",
        };
      }
    }

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};


module.exports = authenticateToken;

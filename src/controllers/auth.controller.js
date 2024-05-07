const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const prisma = require("../models/prismaClient");
const bcrypt = require("bcrypt");
const { JWT_EXP, JWT_SECRET } = require("../configs");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (notHashedPassword, hashedPassword) => {
  return await bcrypt.compare(notHashedPassword, hashedPassword);
};

const login = async (req, res, next) => {
  try {
    const userCred = req.body;
    if (!userCred.email || !userCred.password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: userCred.email },
    });

    if (!user || !(await comparePassword(userCred.password, user.password))) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Invalid email or password" });
    }
    const tasker = await prisma.tasker.findUnique({
      where: { userId: user.id },
    });
    const client = await prisma.tasker.findUnique({
      where: { userId: user.id },
    });
    const token = jwt.sign(
      {
        userID: user.id,
        email: user.email,
        role: client ? "client" : tasker ? "tasker" : "user",
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXP,
      }
    );

    await prisma.user.update({
      where: {
        id: parseInt(user.id),
      },
      data: {
        lastLogin: new Date(),
      },
    });

    res.status(StatusCodes.OK).json({
      user: {
        email: user.email,
        id: user.id,
      },
      token: token,
    });
  } catch (error) {
    next(error);
  }
};

const loginAdmin = async (req, res, next) => {
  try {
    const adminCred = req.body;
    if (!adminCred.email || !adminCred.password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Email and password are required" });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: adminCred.email },
    });

    if (
      !admin ||
      !(await comparePassword(adminCred.password, admin.password))
    ) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        adminID: admin.id,
        email: admin.email,
        role: "admin",
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXP,
      }
    );

    res.status(StatusCodes.OK).json({
      admin: {
        email: admin.email,
        id: admin.id,
      },
      token: token,
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const userCred = req.body;
    const hashedPassword = await hashPassword(userCred.password);
    userCred.password = hashedPassword;

    const user = await prisma.user.create({
      data: {
        firstName: userCred.firstName,
        lastName: userCred.lastName,
        phoneNumber: userCred.phoneNumber,
        email: userCred.email,
        password: userCred.password,
      },
    });

    const token = jwt.sign(
      {
        userID: user.id,
        email: user.email,
        role: "user",
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXP,
      }
    );

    res.status(StatusCodes.OK).json({
      user: {
        email: user.email,
        id: user.id,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const registerClient = async (req, res, next) => {
  try {
    const client = await prisma.client.create({
      data: {
        userId: req.user.id,
      },
    });

    const token = jwt.sign(
      {
        userID: client.id,
        email: client.email,
        role: "client",
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXP,
      }
    );

    res.status(StatusCodes.OK).json({
      user: {
        email: client.email,
        id: client.id,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const registerTasker = async (req, res, next) => {
  let t;

  try {

    t = await prisma.$transaction();

    const taskerInfos = req.body;

    if (req.file) {
      if (req.file.mimetype.startsWith("image/")) {
        taskerInfos.profilePicture = req.file.filename;
      } else {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid file type. Only images are allowed." });
      }
    }

    const tasker = await t.tasker.create({
      data: {
        userId: req.user.id,
        description: taskerInfos.description,
        profilePicture: taskerInfos.profilePicture,
      },
    });
    taskerInfos.addresses = [{ wilaya: "Setif" }];

    for (const address of taskerInfos?.addresses) {
      let addresses = await t.address.findMany({
        where: {
          wilaya: address["wilaya"],
          commune: address["commune"],
        },
      });

      payload = addresses.map((add) => ({
        addressId: add.id,
        taskerId: tasker.userId,
      }));

      await t.taskerAddress.createMany({
        data: payload,
      });
    }

    const token = jwt.sign(
      {
        userID: tasker.userId,
        email: req.user.email,
        role: "tasker",
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXP,
      }
    );

    await t.commit(); 

    res.status(StatusCodes.OK).json({
      user: {
        email: req.user.email,
        id: tasker.userId,
        token,
      },
    });
  } catch (error) {
    if (t) await t.$rollback(); 
    next(error);
  }
};

module.exports = {
  login,
  register,
  hashPassword,
  comparePassword,
  registerClient,
  loginAdmin,
  registerTasker,
};

const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const prisma = require("../models/prismaClient");
const bcrypt = require("bcrypt");
const { JWT_EXP, JWT_SECRET } = require("../configs");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};



async function createAdmin(email, password) {
  try {
    const hashedPassword = await hashPassword(password)

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    console.log('New admin created:', newAdmin);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Usage
// const email = 'admin@gmail.com';
// const password = 'Admin123@';

// createAdmin(email, password);

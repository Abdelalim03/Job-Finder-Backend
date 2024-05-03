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
const email = 'admin@gmail.com';
const password = 'Admin123@';

createAdmin(email, password);


// tasker : 
//"email":"tasker@gmail.com",
//"password" : "Tasker123@"
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImVtYWlsIjoidGFza2VyQGdtYWlsLmNvbSIsInJvbGUiOiJ0YXNrZXIiLCJpYXQiOjE3MTQ3NjE5MDcsImV4cCI6MTcxNzM1MzkwN30.ULSPmxAScboOZrbAwllJ55sl8aJWzYz9g6Yy1CRmb2c


//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImVtYWlsIjoidGFza2VyQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzE0NzYxNjI5LCJleHAiOjE3MTczNTM2Mjl9.VrPOAav2W34TdNH1xUgNz17XZtBElCxsV2TFDD8jldA




// admin Token : 
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklEIjozLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcxNDc1NjI4NSwiZXhwIjoxNzE3MzQ4Mjg1fQ.jRojdz5mJFj_872lgh3P9iz8Xw5DnD296C1otIzjkYc
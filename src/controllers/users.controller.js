const { StatusCodes } = require("http-status-codes");
const prisma = require("../models/prismaClient");
const { setProfilePictureUrl } = require("../utils/managePictures.js");
const { hashPassword } = require("./auth.controller.js");

const getCurrentUser = async (req, res, next) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    if (currentUser.profilePicture) setProfilePictureUrl(currentUser);
    res.status(200).json(currentUser);
  } catch (error) {
    next(error);
  }
};

const updateTasker = async (req, res) => {
  const  userId  = req.user.id;
  const {  profilePicture, description, firstName, lastName, email, phoneNumber, password } = req.body;

  const updateData = {};
  const updateUserData = {};

  if (description !== undefined) updateData.description = description;

  if (firstName !== undefined) updateUserData.firstName = firstName;
  if (lastName !== undefined) updateUserData.lastName = lastName;
  if (email !== undefined) updateUserData.email = email;
  if (phoneNumber !== undefined) updateUserData.phoneNumber = phoneNumber;
  if (password !== undefined) updateUserData.password = await hashPassword(password);

  if (req.file) {
    if (req.file.mimetype.startsWith("image/")) {
      updateData.profilePicture  = req.file.filename;
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid file type. Only images are allowed." });
    }
  }


  try {



      const updatePayload = {
          where: { userId: parseInt(userId) },
          data: {
              ...updateData,
          },
          include: {
              User: {
                select : {
                  firstName:true,
                  lastName:true,
                  email:true,
                  phoneNumber:true,
                }
              } // Include the updated User data in the response
          }
      };

      if (Object.keys(updateUserData).length) {
          updatePayload.data.User = { update: updateUserData };
      }

      const updatedTasker = await prisma.tasker.update(updatePayload);
      res.status(200).json(updatedTasker);
  } catch (error) {
    console.log(error);
      res.status(400).json({ error: error.message });
  }
};

const getUserById = async (req,res,next)=>{
  const userId = parseInt(req.params.id)
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        taskers: {
          select: {
            profilePicture: true,
            userId: true,
            description: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
    }

    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    console.error("Error retrieving user by ID:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while retrieving the user" });
  }
}

const getUserByIdTask = async (req, res, next) => {
  const taskId = parseInt(req.params.id);

  try {
    const user = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        category: true,
        tasker: {
          select: {
            profilePicture: true,
            userId: true,
            User: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Taske not found" });
    }

    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    console.error("Error retrieving user by ID:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while retrieving the user" });
  }
};



const getTaskerAddresses = async (req, res) => {
  const userId = req.params.id;

  try {
      // Fetch the tasker addresses
      const taskerAddresses = await prisma.taskerAddress.findMany({
          where: { taskerId: parseInt(userId) },
          include: {
              address: true // Include the related Address details
          }
      });

      // Structure the response to include the taskerId and the list of addresses
      const response = {
          taskerId: parseInt(userId),
          addresses: taskerAddresses.map(ta => ta.address)
      };

      res.status(200).json(response);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};


const addTaskerAddress = async (req, res) => {
  const  userId  = req.user.id;
  const { wilaya, commune } = req.body;

  try {
      // Create a new address or find an existing one
      const address = await prisma.address.upsert({
          where: {
            Unique_Wilaya_Commune: { wilaya, commune } // Reference the unique constraint
          },
          update: {},
          create: { wilaya, commune }
      });

      // Link the address to the tasker
      const taskerAddress = await prisma.taskerAddress.create({
          data: {
              taskerId: parseInt(userId),
              addressId: address.id
          }
      });

      res.status(201).json(taskerAddress);
  } catch (error) {
    console.log(error);
      res.status(400).json({ error: error.message });
  }
};

const deleteTaskerAddress = async (req, res) => {
  const  addressId  = req.params.id;
  const  userId  = req.user.id;
  try {
      // Delete the tasker address relation
      await prisma.taskerAddress.delete({
          where: {
              taskerId_addressId: {
                  taskerId: parseInt(userId),
                  addressId: parseInt(addressId)
              }
          }
      });

      res.status(200).json({"message":"address deleted successfully "});
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};



module.exports = {
  getCurrentUser,
  getUserByIdTask,
  getUserById,
  updateTasker,
  getTaskerAddresses,
  addTaskerAddress,
  deleteTaskerAddress

};

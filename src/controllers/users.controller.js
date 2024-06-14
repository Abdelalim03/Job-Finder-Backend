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


const getCurrentClient = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id:true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};



const updateClientProfile = async (req, res, next) => {
  const userId = req.user.id;
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
  } = req.body;

  const updateUserData = {};
  if (firstName !== undefined) updateUserData.firstName = firstName;
  if (lastName !== undefined) updateUserData.lastName = lastName;
  if (email !== undefined) updateUserData.email = email;
  if (phoneNumber !== undefined) updateUserData.phoneNumber = phoneNumber;
  if (password !== undefined) updateUserData.password = await hashPassword(password);

  try {
    const updatedClient = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        ...updateUserData,
      },
      select : {
        id:true,
        firstName:true,
        lastName:true,
        email:true,
        phoneNumber:true,

      }
    });

    res.status(200).json(updatedClient);
  } catch (error) {
    next(error);
  }
};



const updateTaskerAddress = async (taskerId, addresses) => {
  // Get the current addresses associated with the tasker
  const currentAddresses = await prisma.taskerAddress.findMany({
    where: {
      taskerId: taskerId,
    },
  });

  // Extract addressIds from the current addresses
  const currentAddressIds = currentAddresses.map(
    (address) => address.addressId
  );

  // Extract addressIds from the provided addresses
  const providedAddressIds = addresses.map((address) => address.id);

  // Find addresses to add (present in provided but not in current)
  const addressesToAdd = addresses.filter(
    (address) => !currentAddressIds.includes(address.id)
  );

  // Find addresses to delete (present in current but not in provided)
  const addressesToDelete = currentAddresses.filter(
    (address) => !providedAddressIds.includes(address.addressId)
  );

  console.log(addressesToAdd, addressesToDelete, currentAddressIds);
  try {
    // Add new addresses
    await Promise.all(
      addressesToAdd.map(async (address) => {
        const addressID = await prisma.address.findUnique({
          where: {
            Unique_Wilaya_Commune: {
              wilaya: address?.wilaya,
              commune: address?.commune,
            },
          },
          select: {
            id: true,
          },
        });

        await prisma.taskerAddress.create({
          data: {
            taskerId: taskerId,
            addressId: addressID.id,
          },
        });
      })
    );

    // Delete old addresses
    await Promise.all(
      addressesToDelete.map(async (address) => {
        await prisma.taskerAddress.deleteMany({
          where: {
            taskerId: taskerId,
            addressId: address.addressId,
          },
        });
      })
    );

    return { success: true, message: "Tasker addresses updated successfully." };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to update tasker addresses.",
      error: error.message,
    };
  }
};

const updateTasker = async (req, res) => {
  const userId = req.user.id;
  const {
    description,
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    addresses, // Assuming addresses is an array of address objects
  } = req.body;

  const updateData = {};
  const updateUserData = {};
  const addressesTab = JSON.parse(addresses);
  if (description !== undefined) updateData.description = description;

  if (firstName !== undefined) updateUserData.firstName = firstName;
  if (lastName !== undefined) updateUserData.lastName = lastName;
  if (email !== undefined) updateUserData.email = email;
  if (phoneNumber !== undefined) updateUserData.phoneNumber = phoneNumber;
  if (password !== undefined)    updateUserData.password = await hashPassword(password);

  if (req.file) {
    if (req.file.mimetype.startsWith("image/")) {
      updateData.profilePicture = req.file.filename;
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid file type. Only images are allowed." });
    }
  }

  try {
    // Update the Tasker
    const updatePayload = {
      where: { userId: parseInt(userId) },
      data: {
        ...updateData,
      },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        }, // Include the updated User data in the response
      },
    };

    if (Object.keys(updateUserData).length) {
      updatePayload.data.User = { update: updateUserData };
    }
    const updatedTasker = await prisma.tasker.update(updatePayload);

    // If addresses are provided, add them

    console.log(addressesTab);
    if (addressesTab && addressesTab.length > 0) {
      await updateTaskerAddress(userId, addressesTab);
    }

    res.status(200).json(updatedTasker);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

const getUserById = async (req, res, next) => {
  const userId = parseInt(req.params.id);
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
            Task: {
              select: {
                id: true,
                price: true,
                description: true,
                ratingAverage: true,
                reviewsCount: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
            _count: {
              select: {
                works: {
                  where: { status: "approved" },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User not found" });
    }

    // Extract and deduplicate categories
    const uniqueCategories = {};
    user.taskers.forEach((tasker) => {
      tasker.Task.forEach((task) => {
        const category = task.category;
        uniqueCategories[category.id] = category;
      });
    });

    // Convert uniqueCategories object to an array
    const categories = Object.values(uniqueCategories);
    console.log(categories);
    // Add unique categories to the user object
    user.taskers[0].categories = categories;

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    console.error("Error retrieving user by ID:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while retrieving the user" });
  }
};



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
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Taske not found" });
    }

    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    console.error("Error retrieving user by ID:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while retrieving the user" });
  }
};

const getTaskerAddresses = async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch the tasker addresses
    const taskerAddresses = await prisma.taskerAddress.findMany({
      where: { taskerId: parseInt(userId) },
      include: {
        address: true, // Include the related Address details
      },
    });

    // Structure the response to include the taskerId and the list of addresses
    const response = {
      taskerId: parseInt(userId),
      addresses: taskerAddresses.map((ta) => ta.address),
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addTaskerAddress = async (req, res) => {
  const userId = req.user.id;
  const { wilaya, commune } = req.body;

  try {
    // Create a new address or find an existing one
    const address = await prisma.address.upsert({
      where: {
        Unique_Wilaya_Commune: { wilaya, commune }, // Reference the unique constraint
      },
      update: {},
      create: { wilaya, commune },
    });

    // Link the address to the tasker
    const taskerAddress = await prisma.taskerAddress.create({
      data: {
        taskerId: parseInt(userId),
        addressId: address.id,
      },
    });

    res.status(201).json(taskerAddress);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

const deleteTaskerAddress = async (req, res) => {
  const addressId = req.params.id;
  const userId = req.user.id;
  try {
    // Delete the tasker address relation
    await prisma.taskerAddress.delete({
      where: {
        taskerId_addressId: {
          taskerId: parseInt(userId),
          addressId: parseInt(addressId),
        },
      },
    });

    res.status(200).json({ message: "address deleted successfully " });
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
  deleteTaskerAddress,
  getCurrentClient,
  updateClientProfile
};

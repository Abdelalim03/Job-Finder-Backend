const { StatusCodes } = require("http-status-codes");
const prisma = require("../models/prismaClient");
const { setProfilePictureUrl } = require("../utils/managePictures.js");

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
                id:true,
                price:true,
                description:true,
                ratingAverage:true,
                reviewsCount:true,
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
      return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
    }

    // Extract and deduplicate categories
    const uniqueCategories = {};
    user.taskers.forEach(tasker => {
      tasker.Task.forEach(task => {
        const category = task.category;
        uniqueCategories[category.id] = category;
      });
    });

    // Convert uniqueCategories object to an array
    const categories = Object.values(uniqueCategories);

    // Add unique categories to the user object
    user.taskers[0].categories = categories;

    res.status(StatusCodes.OK).json({ user });
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

module.exports = {
  getCurrentUser,
  getUserByIdTask,
  getUserById
};

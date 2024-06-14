const { StatusCodes } = require("http-status-codes");
const prisma = require("../models/prismaClient.js");
const { setTaskImageUrl, removeTaskImage } = require("../utils/managePictures.js");

const createTask = async (req, res, next) => {
  uploadedImages = [];
  const files = req.files;
  if (files?.length > 0) {
    for (const file of files) {
      if (file.mimetype.startsWith("image/")) {
        const url = file.filename;
        uploadedImages.push(url);
      } else {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid file type. Only images are allowed." });
      }
    }
  }

  try {
    const { description, price, categoryId } = req.body;
    const user_id = req.user.id;
    if (categoryId !== undefined) {
      const existingCategory = await prisma.category.findUnique({
        where: {
          id: parseInt(categoryId),
        },
      });

      if (!existingCategory) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "Invalid category ID. Category does not exist.",
        });
      }
    }

    const newTask = await prisma.task.create({
      data: {
        description: description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        taskerId: user_id,
        reviewsCount: 0,
        ratingAverage: 0,
        taskImages: {
          create: uploadedImages.map((image) => ({
            url: image,
          })),
        },
      },
    });
    res.status(StatusCodes.OK).json({
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.id;

    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        taskerId: true,
        taskImages: true,
      },
    });

    if (!existingTask) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Task not found.",
      });
    }

    if (existingTask.taskerId !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error:
          "You are not authorized to delete this task you must be the owner.",
      });
    }

    const taskImages = existingTask.taskImages
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    for (const image of taskImages) {
        await removeTaskImage(image.url)
    }



    res.status(StatusCodes.OK).json({
      message: "Task deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const { description, price, categoryId } = req.body;
    const userId = req.user.id;
    uploadedImages = [];
    const files = req.files;
  
    if (files?.length > 0) {
      for (const file of files) {
        if (file.mimetype.startsWith("image/")) {
          const url = file.filename;
          uploadedImages.push(url);
        } else {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: "Invalid file type. Only images are allowed." });
        }
      }
    }


    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        taskerId: true,
        taskImages : true
      },
    });

    if (!existingTask) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Task not found.",
      });
    }

    if (existingTask.taskerId !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "You are not authorized to update this task.",
      });
    }
    const price_task = price ? parseFloat(price) : price;
    const categoryId_task = categoryId ? parseInt(categoryId) : categoryId;

    if (categoryId !== undefined) {
      const existingCategory = await prisma.category.findUnique({
        where: {
          id: parseInt(categoryId),
        },
      });

      if (!existingCategory) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "Invalid category ID. Category does not exist.",
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        description: description,
        price: price_task,
        categoryId: categoryId_task,
        taskImages: {
          deleteMany: {}, 
          create: uploadedImages.map((image) => ({
            url: image,
          })),
        },
      },
    });

    for (const imageUrl of existingTask.taskImages) {
      console.log(imageUrl.url);
      const filename = imageUrl.url;
      await removeTaskImage(filename)
    }

    res.status(StatusCodes.OK).json({
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};


const getTasks = async (req, res, next) => {
  try {

    const { page = 1, limit = 10 } = req.query;

    const tasks = await prisma.task.findMany({
      skip: (page - 1) * limit,
      take: parseInt(limit),
      include: {
        taskImages: true,
        category: true,
        tasker: {
          include: {
            User: {select : {
              firstName:true,
              id:true,
              lastName:true,
              email:true
            }},
          },
        },
      },
    });

    const totalTasks = await prisma.task.count();

    res.status(StatusCodes.OK).json({
      data: tasks,
      total: totalTasks,
      page: parseInt(page),
      totalPages: Math.ceil(totalTasks / limit),
    });
  } catch (error) {
    next(error);
  }
};


const getMyTasks = async (req, res, next) => {
  try {

    const userId  = req.user.id;
    const tasks = await prisma.task.findMany({
      where: {taskerId : userId},
      include: {
        taskImages: true,
        category: true,
        tasker: {
          include: {
            User: {select : {
              firstName:true,
              id:true,
              lastName:true,
              email:true
            }},
          },
        },
      },
    });


    res.status(StatusCodes.OK).json({
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        taskImages: true,
        tasker: {
          select:{
            profilePicture:true,
            userId:true,
            User:{
              select:{
                firstName:true,
                lastName:true
              }
            }
          }
        },
        category:true,
      },
    });

    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Task not found.",
      });
    }

    // Flatten the array of work reviews
    const works = await prisma.work.findMany({
      where: {
        categoryId: task.categoryId,
        taskerId: task.taskerId,
      },
      include: {
        WorkReview: true,
        client: { include : {User : {
          select : 
          {
            id : true,
            firstName:true,
            lastName:true
          }
        }

        }}
      },
    });

    // Flatten the array of WorkReviews
    const workReviews = works.flatMap((work) => {
      return work.WorkReview.map((review) => {
        return {
          ...review,
          client: work.client.User, 
        };
      });
    });
    res.status(StatusCodes.OK).json({
      data: {
        task: task,
        workReviews: workReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};


const filterTasks = async (req, res, next) => {
  try {
    const { categoryId, wilaya, commune, maxPrice, page = 1, pageSize = 10 } = req.query;

    let filterOptions = {};

    // Filter by category ID if provided
    if (categoryId) {
      filterOptions.categoryId = parseInt(categoryId);
    }

    // Filter by wilaya if provided
    if (wilaya) {
      filterOptions.tasker = {
        TaskerAddress: {
          some: {
            address: {
              wilaya: wilaya,
            },
          },
        },
      };
    }

    // Filter by commune if provided
    if (commune) {
      filterOptions.tasker = {
        TaskerAddress: {
          some: {
            address: {
              commune: commune,
            },
          },
        },
      };
    }

    // Filter by max price if provided
    if (maxPrice) {
      filterOptions.price = {
        lte: parseFloat(maxPrice),
      };
    }

    // Calculate skip count for pagination
    const skipCount = (page - 1) * pageSize;

    // Count total tasks matching the filter options
    const totalTasksCount = await prisma.task.count({
      where: filterOptions,
    });

    // Fetch the filtered tasks with pagination
    const filteredTasks = await prisma.task.findMany({
      where: filterOptions,
      include: {
        taskImages: true,
        tasker: true,
        category: true,
      },
      skip: skipCount,
      take: parseInt(pageSize),
    });

    // Calculate total number of pages
    const totalPages = Math.ceil(totalTasksCount / pageSize);

    res.status(StatusCodes.OK).json({
      data: filteredTasks,
      totalPages: totalPages,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  getTaskById,
  filterTasks,
  getMyTasks
};

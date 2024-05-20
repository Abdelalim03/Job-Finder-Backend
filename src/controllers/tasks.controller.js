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
            User: true,
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



const getTaskById = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        taskImages: true,
        category: true,
        tasker: {
          include: {
            User: true,
          },
        },
        WorkReview: true,
      },
    });

    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Task not found.",
      });
    }

    res.status(StatusCodes.OK).json({
      data: task,
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
  getTaskById
};

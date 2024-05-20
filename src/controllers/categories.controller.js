const { StatusCodes } = require("http-status-codes");
const prisma = require("../models/prismaClient.js");

const createCategory = async (req, res, next) => {
  try {
    const data = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: {
        name: data.name,
      },
    });

    if (existingCategory) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Category with the same name already exists",
      });
    }

    const newCategory = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
    res.status(StatusCodes.OK).json({
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);
    const data = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!existingCategory) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Category not found",
      });
    }

    if (data.name) {
      const categoryWithSameName = await prisma.category.findFirst({
        where: {
          name: data.name,
          NOT: {
            id: categoryId,
          },
        },
      });

      if (categoryWithSameName) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "Another category with the same name already exists",
        });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    res.status(StatusCodes.OK).json({
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);

    const existingCategory = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!existingCategory) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Category not found",
      });
    }

    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    res.status(StatusCodes.OK).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany();

    res.status(StatusCodes.OK).json({
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories
};

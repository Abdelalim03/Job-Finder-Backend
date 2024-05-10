const { StatusCodes } = require("http-status-codes");
const prisma = require("../models/prismaClient.js");

const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    const newReview = await prisma.review.create({
      data: {
        userId: parseInt(userId),
        rating: parseInt(rating),
        comment: comment,
      },
    });

    res.status(StatusCodes.OK).json({
      data: newReview,
    });
  } catch (error) {
    next(error);
  }
};

const getReviewById = async (req, res, next) => {
  try {
    const reviewId = parseInt(req.params.id);

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Review not found.",
      });
    }

    res.status(StatusCodes.OK).json({
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { rating, comment } = req.body;

    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        rating: parseInt(rating),
        comment: comment,
      },
    });

    res.status(StatusCodes.OK).json({
      data: updatedReview,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  const reviewId = parseInt(req.params.id);

  try {
    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    res.status(StatusCodes.OK).json({
      message: "Review deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, deleteReview, getReviewById, updateReview };

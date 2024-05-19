const { StatusCodes } = require("http-status-codes");
const prisma = require("../models/prismaClient.js");
const { setProfilePictureUrl } = require("../utils/managePictures.js");

const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const newReview = await prisma.review.create({
      data: {
        userId: parseInt(userId),
        rating: parseInt(rating),
        comment: comment,
      },
    });

    const review = await prisma.review.findUnique({
      where: { id: newReview.id },
      select: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            id: true,
            taskers: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
        rating: true,
        comment: true,
      },
    });

    if (review.user.taskers && review.user.taskers.length > 0) {
      review.user.profilePicture = setProfilePictureUrl(review.user.taskers[0]);
    } else {
      review.user.profilePicture = undefined;
    }
    delete review.user.taskers;

    res.status(StatusCodes.OK).json(review);
  } catch (error) {
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    const filterHighRating = req.query.best === "true";

    const reviews = await prisma.review.findMany({
      where: filterHighRating ? { rating: { gte: 3 } } : {},
      take: filterHighRating ? 3 : undefined,
      select: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            id: true,
            taskers: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
        rating: true,
        comment: true,
      },
    });

    // Process each review to move the profilePicture directly into the user object if they are a tasker
    reviews.forEach((review) => {
      if (review.user.taskers && review.user.taskers.length > 0) {
        review.user.profilePicture = setProfilePictureUrl(
          review.user.taskers[0]
        );
      } else {
        review.user.profilePicture = undefined;
      }
      delete review.user.taskers; // Remove the taskers property from the user
    });

    res.status(StatusCodes.OK).json(reviews);
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

module.exports = {
  createReview,
  deleteReview,
  getReviewById,
  updateReview,
  getReviews,
};

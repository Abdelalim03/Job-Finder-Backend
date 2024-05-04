const express = require("express");
const reviewsRouter = express.Router();
const {
  createReview,
  deleteReview,
  updateReview,
  getReviewById,
} = require("../controllers/reviews.controller.js");
const authenticateToken = require("../middlewares/auth.middleware.js");
const {
  reviewValidator,
  createReviewRules,
  updateReviewRules,
} = require("../middlewares/validators/reviews.validator.js");
const { authRoles } = require("../middlewares/roles.middleware.js");
const { verifyReviewUser } = require("../middlewares/reviews.middleware.js");

reviewsRouter
  .route("/:id", authRoles(["client", "tasker", "admin"]))
  .get(getReviewById);
reviewsRouter
  .route("/create")
  .post(
    authenticateToken,
    authRoles(["client", "tasker"]),
    createReviewRules,
    reviewValidator,
    createReview
  );
reviewsRouter
  .route("/update/:id")
  .put(
    authenticateToken,
    authRoles(["client", "tasker", "admin"]),
    verifyReviewUser,
    updateReviewRules,
    reviewValidator,
    updateReview
  );
reviewsRouter
  .route("/delete/:id")
  .delete(
    authenticateToken,
    authRoles(["client", "tasker", "admin"]),
    verifyReviewUser,
    deleteReview
  );

module.exports = reviewsRouter;

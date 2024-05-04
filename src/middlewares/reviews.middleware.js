const { StatusCodes } = require("http-status-codes");

const verifyReviewUser = async (req, res, next) => {
  const review = await prisma.review.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!review) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: "Review not found.",
    });
  }

  if (review.userId !== req.user.userId || req.user.role !== "admin") {
    return res.status(StatusCodes.UNAUTHORIZED).reject("Unauthorized");
  }
  next();
};

module.exports = { verifyReviewUser };

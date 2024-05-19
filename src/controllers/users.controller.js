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

module.exports = {
  getCurrentUser,
};

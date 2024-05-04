const path = require("path");
const fs = require("fs").promises;

const {
  PICS_FOLDER,
  UPLOAD_PATH,
  Task_IMG_FOLDER,
} = require("../configs/index.js");

const removeProfilePicture = async (picture) => {
  try {
    //   if (picture !== 'default.png' && picture !== 'admin.png') {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      UPLOAD_PATH,
      PICS_FOLDER,
      picture
    );
    await fs.unlink(filePath);
    //   }
  } catch (error) {
    console.log(error);
  }
};
const setProfilePictureUrl = (user) => {
  return (user.profilePicture =
    "/" + UPLOAD_PATH + PICS_FOLDER + encodeURIComponent(user.profilePicture));
};

const setTaskImageUrl = (image) => {
  return "/" + UPLOAD_PATH + Task_IMG_FOLDER + encodeURIComponent(image);
};

const removeTaskImage = async (image) => {
  try {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      UPLOAD_PATH,
      Task_IMG_FOLDER,
      image
    );
    await fs.unlink(filePath);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  setProfilePictureUrl,
  removeProfilePicture,
  setTaskImageUrl,
  removeTaskImage
};

const path = require("path");
const fs = require("fs").promises;

const { PICS_FOLDER, UPLOAD_PATH } = require("../configs/index.js");

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

module.exports = { setProfilePictureUrl, removeProfilePicture };

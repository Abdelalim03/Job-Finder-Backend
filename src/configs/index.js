const PORT = Number(process.env.PORT) || 8000;
const JWT_SECRET = process.env.JWT_SECRET || "DUMMY_KEY";
const JWT_EXP = Number(process.env.JWT_EXP) || 2592000;
const UPLOAD_PATH = process.env.UPLOAD_PATH || "uploads/";
const PICS_FOLDER = process.env.PICS_FOLDER || "pictures/";
const fs = require("fs");
const multer = require("multer");
const path = require("path");

//create upload and pics folders if they don't exist
const uploadDirPath = path.join(__dirname, UPLOAD_PATH);
if (!fs.existsSync(uploadDirPath)) fs.mkdirSync(uploadDirPath);
const picsDir = path.join(uploadDirPath, PICS_FOLDER);
if (!fs.existsSync(picsDir)) fs.mkdirSync(picsDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profilePicture") {
      cb(null, UPLOAD_PATH + PICS_FOLDER);
    } else {
      cb(null, UPLOAD_PATH);
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

module.exports = {
  PORT,
  JWT_SECRET,
  JWT_EXP,
  UPLOAD_PATH,
  PICS_FOLDER,
  upload,
};

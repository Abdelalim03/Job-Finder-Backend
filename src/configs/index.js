const PORT = Number(process.env.PORT) || 8000;
const JWT_SECRET = process.env.JWT_SECRET || "DUMMY_KEY";
const JWT_EXP = Number(process.env.JWT_EXP) || 2592000;
const UPLOAD_PATH = process.env.UPLOAD_PATH || "uploads/";
const PICS_FOLDER = process.env.PICS_FOLDER || "pictures/";
const Task_IMG_FOLDER = process.env.Task_IMG_FOLDER || "taskImages/";

const fs = require("fs");
const multer = require("multer");
const path = require("path");
const uploadDirPath = path.join(__dirname, UPLOAD_PATH);
if (!fs.existsSync(uploadDirPath)) fs.mkdirSync(uploadDirPath);

const picsDir = path.join(uploadDirPath, PICS_FOLDER);
if (!fs.existsSync(picsDir)) fs.mkdirSync(picsDir);

const taskImgsDir = path.join(uploadDirPath, Task_IMG_FOLDER);
if (!fs.existsSync(taskImgsDir)) fs.mkdirSync(taskImgsDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profilePicture") {
      cb(null, path.join(UPLOAD_PATH, PICS_FOLDER));
    } else if (file.fieldname === "taskimages") {
      cb(null, path.join(UPLOAD_PATH, Task_IMG_FOLDER));
    } else {
      cb(null, UPLOAD_PATH);
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const imageFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    // Check if the file extension is one of the allowed image types
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true); 
};


const upload = multer({ storage: storage,fileFilter :imageFilter });


module.exports = {
  PORT,
  JWT_SECRET,
  JWT_EXP,
  UPLOAD_PATH,
  PICS_FOLDER,
  Task_IMG_FOLDER,
  upload,
};

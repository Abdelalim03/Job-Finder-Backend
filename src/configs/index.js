const PORT = Number(process.env.PORT) || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'DUMMY_KEY';
const JWT_EXP = Number(process.env.JWT_EXP) || 2592000;
const UPLOAD_PATH = process.env.UPLOAD_PATH || 'uploads/';
const PICS_FOLDER = process.env.PICS_FOLDER || 'pictures/';






module.exports = {
    PORT,
    JWT_SECRET,
    JWT_EXP,
    UPLOAD_PATH,
    PICS_FOLDER,
  };
  
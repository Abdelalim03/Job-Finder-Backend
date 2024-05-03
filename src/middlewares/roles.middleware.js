const { StatusCodes } = require("http-status-codes");

const verifyClient = (req, res, next) => {
  if (req.user?.role == "client") {
    next();
  } else {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Unauthorized, this action require client privileges",
    });
  }
};

const verifyTasker = (req, res, next) => {
  if (req.user?.role == "tasker") {
    next();
  } else {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Unauthorized, this action require tasker privileges",
    });
  }
};

const verifyUser = (req, res, next) => {
  if (req.user?.role == "user") {
    next();
  } else {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Unauthorized, this action require user privileges",
    });
  }
};


module.exports = { verifyClient, verifyTasker, verifyUser };

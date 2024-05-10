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
  console.log(req.user?.role);
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

const verifyAdmin = (req, res, next) => {
  if (req.user?.role == "admin") {
    next();
  } else {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Unauthorized, this action require admin privileges",
    });
  }
};


function authRoles(roles) {
  return  (req, res, next)=> {
  try {
    if (roles.includes(req.user?.role)) {
      next();
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Unauthorized",
      });
    }
  } catch (error) {
    next(error);
  }
}
}

module.exports = {
  verifyClient,
  verifyTasker,
  verifyUser,
  verifyAdmin,
  authRoles,
};

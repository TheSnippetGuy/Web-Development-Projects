import ExpressError from "../utils/ExpressError.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new ExpressError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.keys(err.keyValue)[0];
  const message = `Duplicate Field Value:${value}. Please Enter an Invalid Value`;
  return new ExpressError(message, 400);
};

const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input Data. ${errors.join(". ")}`;
  return new ExpressError(message, 400);
};

const handleJWTError = (err) => {
  return new ExpressError("Invalid Token. Please LogIn Again", 401);
};

const handleJWTExpiredError = (err) => {
  return new ExpressError("Token Expired. Please Login Again", 401);
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  err.message = err.message;
  if (err.name === "CastError") err = handleCastErrorDB(err);
  if (err.code === 11000) err = handleDuplicateFieldsDB(err);
  if (err.name === "ValidationError") err = handleValidationErrorDb(err);
  if (err.name === "JsonWebTokenError") err = handleJWTError();
  if (err.name === "TokenExpiredError") err = handleJWTExpiredError();
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

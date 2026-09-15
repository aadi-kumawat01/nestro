const sendSuccess = (res, message = "success") => {
  return res.status(200).json({
    success: true,
    message,
  });
};

const sendCreated = (res, message = "Create successfully") => {
  return res.status(201).json({
    success: true,
    message,
  });
};

const sendBadRequest = (res, message = "Bad request") => {
  return res.status(400).json({
    success: false,
    message,
  });
};

const sendNotFound = (res, message = "Resource not found") => {
  return res.status(404).json({
    success: false,
    message,
  });
};

const sendConflict = (res, message = "Data already exists") => {
  return res.status(409).json({
    success: false,
    message,
  });
};

const sendServerError = (res, error) => {
  if (error) console.error(error);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export {
  sendBadRequest,
  sendConflict,
  sendCreated,
  sendNotFound,
  sendServerError,
  sendSuccess,
};

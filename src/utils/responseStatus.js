const setSuccessStatus = (res, data, obj = {}) =>
  res.status(200).json({
    status: 'Success',
    data: data,
    ...obj,
  });

const setInternalServerError = (res, data, obj = {}) =>
  res.status(500).json({
    status: 'Error',
    message: 'Internal Server Error',
    error: data,
    ...obj,
  });

const setBadRequestError = (res, data) =>
  res.status(400).json({
    status: 'Error',
    message: 'Bad Request',
    error: data,
  });

const setNotFoundRequestError = (res, data) =>
  res.status(404).json({
    status: 'Error',
    message: 'Not Found',
    error: data,
  });

const setUnauthorizedError = (res, data) =>
  res.status(401).json({
    status: 'Error',
    message: 'Unauthorized Access',
    error: data,
  });

module.exports = {
  setSuccessStatus,
  setInternalServerError,
  setBadRequestError,
  setUnauthorizedError,
  setNotFoundRequestError,
};

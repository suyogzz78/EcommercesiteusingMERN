const successResponse = (res, data, message = 'Success', code = 200) => {
  return res.status(code).json({ status: 'success', message, data });
};

const errorResponse = (res, message = 'Error', code = 500) => {
  return res.status(code).json({ status: 'error', message });
};

module.exports = { successResponse, errorResponse };

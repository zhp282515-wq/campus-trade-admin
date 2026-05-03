const { fail } = require('../utils/response');

function errorHandler(error, req, res, next) {
  console.error('Global error:', error);

  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || '服务器内部错误';

  return fail(res, message, statusCode);
}

module.exports = errorHandler;

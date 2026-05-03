function success(res, data = null, message = 'success') {
  return res.json({
    code: 200,
    message,
    data
  });
}

function fail(res, message = '服务器错误', code = 500, data = null) {
  return res.status(code).json({
    code,
    message,
    data
  });
}

module.exports = {
  success,
  fail
};

/ utils/response.js
// Response formatter helper

exports.success = (res, data = null, message = "Success", code = 200) => {
  return res.status(code).json({
    code,
    status: "success",
    message,
    data,
  });
};

exports.error = (res, message = "Error", code = 500, errors = null) => {
  const response = {
    code,
    status: "error",
    message,
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(code).json(response);
};

exports.paginated = (res, data, pagination, message = "Success") => {
  return res.json({
    code: 200,
    status: "success",
    message,
    data,
    pagination,
  });
};
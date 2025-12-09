function errorHandler(err, req, res, next) {
  console.error("🔥 Error:", err);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
}

module.exports = errorHandler;
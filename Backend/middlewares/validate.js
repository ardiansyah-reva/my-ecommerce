//middlewares/validate.js

exports.validate = (rules) => {
  return (req, res, next) => {
    const errors = [];

    for (const rule of rules) {
      if (!req.body[rule]) {
        errors.push(`${rule} wajib diisi`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Validasi gagal",
        errors,
      });
    }

    next();
  };
};

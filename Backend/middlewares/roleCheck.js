// Backend/middlewares/roleCheck.js

const roleCheck = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({
        status: 'error',
        message: 'Role tidak ditemukan'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: 'error',
        message: `Akses ditolak. Hanya ${allowedRoles.join(', ')} yang diperbolehkan`
      });
    }

    next();
  };
};

const sellerOnly = roleCheck(['seller', 'admin']);
const adminOnly = roleCheck(['admin']);

const sellerApproved = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role !== 'seller') {
    return res.status(403).json({
      status: 'error',
      message: 'Hanya seller yang diperbolehkan'
    });
  }

  if (req.user.seller_status !== 'approved') {
    return res.status(403).json({
      status: 'error',
      message: `Status seller: ${req.user.seller_status}. Hubungi admin untuk approval`
    });
  }

  next();
};

module.exports = {
  roleCheck,
  sellerOnly,
  adminOnly,
  sellerApproved
};
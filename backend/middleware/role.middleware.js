const checkAdmin = (req, res, next) => {
  // Assuming auth.middleware has already decoded the token and added 'user' to req
  // and that the user object in Firebase has a 'role' field.
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};

module.exports = { checkAdmin };
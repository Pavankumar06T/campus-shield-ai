const checkAdmin = (req, res, next) => {
  // PROTOTYPE MODIFICATION: Allow any authenticated user to access Admin routes
  if (req.user) {
    next();
  } else {
    return res.status(403).json({ message: "Access denied." });
  }
};
const checkStudent = (req, res, next) => {

  if (req.user && req.user.role === 'student') {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Students only." });
  }

};
module.exports = { checkAdmin, checkStudent };
const owner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).send("Unauthorized. Please login.");
  }

  // Check if user is owner
//   if () {
//     return res.status(403).send("Access denied. Admin only.");
//   }

  next();
};

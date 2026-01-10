const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  
  // Check if token matches the ADMIN_SECRET in .env
  if (token === process.env.ADMIN_SECRET) {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }
};

module.exports = protect;
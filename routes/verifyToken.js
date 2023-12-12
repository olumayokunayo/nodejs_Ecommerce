const Jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token)
    return res.status(400).json({
      status: "Fail",
      message: "Access Denied",
    });

  try {
    const verified = Jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: "Invalid Token",
    });
  }
};

module.exports = verifyToken;

const router = require("express").Router();
const User = require("../models/user");
const { registerValidation, loginValidation } = require("../validation");
const bcrypt = require("bcryptjs");
const Jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error)
    return res.status(400).json({
      status: "Fail",
      message: error.details[0].message,
    });

  const { name, email, password, role } = req.body;
  const emailExists = await User.findOne({ email: email });
  if (emailExists)
    return res.status(400).json({
      status: "Fail",
      message: "Email already exists!",
    });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role: role || "user", // If role is provided, use it; otherwise, default to 'user'
  });

  const savedUser = await newUser.save();
  res.status(201).json({
    status: "Success",
    message: "User created successfully",
    data: savedUser,
  });
});

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error)
    return res.status(400).json({
      status: "Fail",
      message: error.details[0].message,
    });
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user)
    return res.status(400).json({
      status: "Fail",
      message: "Email does not exist",
    });
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).json({
      status: "Fail",
      message: "Incorrect email or password!",
    });

  const token = Jwt.sign(
    { _id: user._id, role: user.role },
    process.env.TOKEN_SECRET
  );
  req.header("auth-token");
  res.status(200).json({
    status: "Success",
    message: token,
  });
});

module.exports = router;

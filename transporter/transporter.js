const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "codeathon2030@gmail.com",
    pass: "capg ckid argg iaox",
    // pass: process.env.USER_PASS,
  },
});

module.exports = transporter;

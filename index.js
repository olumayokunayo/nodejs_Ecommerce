const dotenv = require("dotenv").config();
const express = require("express");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("DB CONNECTED"))
  .catch((err) => console.error("Error Occurred", err));

app.use("/api/v1/user", authRoute);
app.use("/api/v1/", productRoute);

app.listen(8000, () => console.log("Server is up and running...˝"));

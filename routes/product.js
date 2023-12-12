const router = require("express").Router();
const Product = require("../models/product");
const verifyToken = require("./verifyToken");

// create/post products
router.post("/products", verifyToken, async (req, res) => {
  try {
    const { title, description, price } = req.body;
    if (req.user.role !== "admin")
      return res.status(403).json({
        status: "Fail",
        message: "Unauthorized Access, only ADMIN can make changes!",
      });
    const product = new Product({
      title,
      description,
      price,
    });
    const newProduct = await product.save();
    res.status(201).json({
      status: "Success",
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error,
    });
  }
});

router.get("/products", verifyToken, async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      status: "Success",
      message: "Products fetched successfully",
      length: products.length,
      data: products,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});
module.exports = router;

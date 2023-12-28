const router = require("express").Router();
const Product = require("../models/product");
const verifyToken = require("./verifyToken");
const axios = require("axios");
// create/post products - admin
router.post("/products", verifyToken, async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    if (req.user.role !== "admin")
      return res.status(403).json({
        status: "Fail",
        message: "Unauthorized Access, only ADMIN can make changes!",
      });
    const product = new Product({
      title,
      description,
      price,
      category,
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

// get all products - user
router.get("/products", async (req, res) => {
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

// get single product - user
router.get("/products/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const product = await Product.findById({ _id: taskId });
    res.status(200).json({
      status: "Success",
      message: "Product searching..",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// update product - admin
router.patch("/products/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(404).json({
        status: "Fail",
        message: "Only admin can perform this action.",
      });
    const taskId = req.params.id;
    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: taskId },
      { $set: req.body },
      { new: true }
    );
    if (!updatedProduct)
      return res.status(400).json({
        status: "Fail",
        message: "No product found",
      });
    res.status(200).json({
      status: "Success",
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// delete product - admin
router.delete("/products/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(404).json({
        staus: "Fail",
        message: "Only admin can perform this action.",
      });
    const taskId = req.params.id;
    const product = await Product.findByIdAndDelete({ _id: taskId });
    res.status(200).json({
      status: "Success",
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// filter by price - user
router.get("/products/filter/price", verifyToken, async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.query;
    const filteredProducts = await Product.find({
      price: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) },
    });
    res.status(200).json({
      status: "Success",
      length: filteredProducts.length,
      data: filteredProducts,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// filter by title - admin
router.get("/products/filter/title", verifyToken, async (req, res) => {
  try {
    const { titleName } = req.query;
    const filteredProducts = await Product.find({ title: titleName });
    res.status(200).json({
      status: "Success",
      length: filteredProducts.length,
      data: filteredProducts,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// filter by category - user
router.get("/products/filter/category", async (req, res) => {
  try {
    let { categoryName } = req.query;
    categoryName = new RegExp(categoryName, "i");
    const filteredProducts = await Product.find({ category: categoryName });
    res.status(200).json({
      status: "Success",
      length: filteredProducts.length,
      data: filteredProducts,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// filter by search
router.get("/products/search", async (req, res) => {
  try {
    const { query } = req.query;
    const results = await Product.aggregate([
      {
        $search: {
          text: {
            query: query,
            path: ["title", "description", "category"],
          },
        },
      },
    ]);
    console.log(results);
    res.status(200).json({
      status: "Success",
      length: results.length,
      data: results,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// stock level
router.get("/products/:id/stock", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product)
      return res.status(400).json({
        status: "Fail",
        message: "Product not found",
      });

    const stockLevel = product.stockQuantity;
    res.status(200).json({
      status: "Success",
      productId,
      stockQuantity: stockLevel,
      title: product.title,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// update stock
router.patch("/products/:id/stock", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(404).json({
        status: "Fail",
        message: "Only admin can perform this action",
      });
    const productId = req.params.id;

    const { stockQuantity } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(400).json({
        status: "Fail",
        message: "Product not found",
      });

    product.stockQuantity = stockQuantity;
    await product.save();

    res.status(200).json({
      status: "Success",
      productId,
      updatedStockQuantity: stockQuantity,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// fetch products data from external data
router.get("/fetch-external-api", async (req, res) => {
  try {
    const response = await axios.get("https://fakestoreapi.com/products");
    const data = response.data;
    res.status(200).json({
      status: "Success",
      length: data.length,
      data: data,
    });
  } catch (error) {
    res.status(200).json({
      status: "Fail",
      message: error.message,
    });
  }
});
module.exports = router;

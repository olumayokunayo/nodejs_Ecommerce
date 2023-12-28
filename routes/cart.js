const Product = require("../models/product");
const User = require("../models/user");
const verifyToken = require("./verifyToken");

const router = require("express").Router();

// cart item
router.post("/cart", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;
    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({
        status: "Fail",
        message: "User not found",
      });

    // check product stock quantity
    const product = await Product.findById(productId);
    const productStock = product.stockQuantity;
    if (quantity > productStock)
      return res.status(400).json({
        status: "Fail",
        message: `Stock level is low: ${productStock}`,
      });
    const productToAdd = {
      productId,
      quantity: quantity || 1,
    };

    user.cart.push(productToAdd);
    await user.save();
    res.status(200).json({
      status: "Success",
      message: "Product added to the cart",
      data: user.cart,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// get cart items
router.get("/cart", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user)
      return res.status(400).json({
        status: "Fail",
        message: "User not found",
      });

    const cartItems = user.cart;

    const populatedCart = await Promise.all(
      cartItems.map(async (cartItem) => {
        const product = await Product.findById(cartItem.productId);
        return {
          product,
          quantity: cartItem.quantity,
        };
      })
    );

    res.status(200).json({
      status: "Success",
      message: "Cart retrieved successfully",
      data: populatedCart.map(({ product, quantity, price }) => ({
        product,
        quantity,
        price,
      })),
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// update cart - not working yet
router.patch("/cart/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const cardItemId = req.params.id;
    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({
        status: "Fail",
        message: "User not found",
      });

    const cartIndex = user.cart.findIndex(
      (item) => item._id.toString() === cardItemId.toString()
    );
    if (cartIndex === -1) {
      return res.status(404).json({
        status: "Fail",
        message: "Cart item not found",
      });
    }

    user.cart[cartIndex].quantity = req.body.quantity;
    await user.save();
    res.status(200).json({
      status: "Success",
      data: user.cart[cartIndex],
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// delete cart item
router.delete("/cart/:id", verifyToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({
        status: "Fail",
        message: "User not found",
      });

    const product = await Product.findByIdAndDelete(productId);
    res.status(200).json({
      status: "Success",
      message: "Product deleted succesfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});
module.exports = router;

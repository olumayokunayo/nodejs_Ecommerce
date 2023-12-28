const { default: mongoose } = require("mongoose");
const Product = require("../models/product");
const User = require("../models/user");
const verifyToken = require("./verifyToken");

const router = require("express").Router();

// post review
router.post("/:productId/reviews", verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user._id;

    const { rating, comment } = req.body;
    console.log(productId, rating, comment);

    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({
        status: "Fail",
        message: "User not found",
      });

    const product = await Product.findById(productId);
    if (!product)
      return res.status(400).json({
        status: "Fail",
        message: "Product is not found.",
      });

    product.reviews.push({
      user: userId,
      rating: rating,
      comment: comment,
      dateCreated: Date.now(),
    });

    await product.save();
    res.status(200).json({
      status: "Success",
      data: product.reviews,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});

// update review
router.patch("/:productId/reviews/:reviewId", verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user._id;
    const reviewId = req.params.reviewId;

    const { rating, comment } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({
        status: "Fail",
        message: "User not found",
      });

    const product = await Product.findById(productId);
    if (!product)
      return res.status(400).json({
        status: "Fail",
        message: "Product is not found.",
      });

    const reviewToUpdate = product.reviews.id(reviewId);
    if (!reviewToUpdate)
      return res.status(400).json({
        status: "Fail",
        message: "Review is not found",
      });
    reviewToUpdate.rating = rating;
    reviewToUpdate.comment = comment;
    await product.save();
    res.status(200).json({
      status: "Success",
      data: {
        newRating: reviewToUpdate.rating,
        newComment: reviewToUpdate.comment,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
});
module.exports = router;

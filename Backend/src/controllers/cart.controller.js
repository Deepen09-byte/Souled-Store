import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockCheck } from "../dao/product.dao.js";
import mongoose from "mongoose";
import { checkout } from "../services/payment.service.js";
import { getCartDetails } from "../dao/cart.dao.js";


export const addToCart = async (req, res) => {
  const { id, variantId } = req.params;

  const { quantity = 1 } = req.body;

  const product = await productModel.findOne({
    _id: id,
    "variants._id": variantId,
  });

  if (!product) {
    return res
      .status(404)
      .json({ message: "Product or variant not found", success: false });
  }

  const stock = await stockCheck(id, variantId, 1);

  const cart =
    (await cartModel.findOne({ user: req.user._id })) ||
    (await cartModel.create({ user: req.user._id }));

  const isProductInCart = cart.items.some(
    (item) =>
      item.product.toString() === id && item.variant.toString() === variantId,
  );

  if (isProductInCart) {
    const quantityInCart = cart.items.find(
      (item) =>
        item.product.toString() === id && item.variant.toString() === variantId,
    ).quantity;

    if (quantityInCart + quantity > stock) {
      return res
        .status(400)
        .json({
          message: "Cannot add more items than available in stock",
          success: false,
        });
    }

    await cartModel.findOneAndUpdate(
      { user: req.user._id, "items.product": id, "items.variant": variantId },
      { $inc: { "items.$.quantity": quantity } },
      { new: true },
    );

    return res
      .status(200)
      .json({ message: "Product quantity updated in cart", success: true });
  }

  if (quantity > stock) {
    return res
      .status(400)
      .json({
        message: "Cannot add more items than available in stock",
        success: false,
      });
  }

  cart.items.push({
    product: id,
    variant: variantId,
    quantity,
    price: product.price,
  });

  await cart.save();

  return res
    .status(201)
    .json({ message: "Product added to cart", success: true });
};

export const getCart = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Create a cart only if no cart document exists

    let cart = await getCartDetails(userId);

    if (!cart) {
      const newCart = await cartModel.create({
        user: userId,
        items: [],
      });

      cart = {
        _id: newCart._id,
        user: newCart.user,
        items: [],
        totalPrice: 0,
        currency: "INR",
      };
    }

    return res.status(200).json({
      message: "Cart retrieved successfully",
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      message: "Failed to retrieve cart",
      success: false,
      error: error.message,
    });
  }
};

export const incrementCartQuantity = async (req, res) => {
  const { id, variantId } = req.params;

  const product = await productModel.findOne({
    _id: id,
    "variants._id": variantId,
  });

  if (!product) {
    return res
      .status(404)
      .json({ message: "Product or variant not found", success: false });
  }

  const cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({ message: "Cart not found", success: false });
  }

  const stock = await stockCheck(id, variantId, 1);

  const itemQuantity =
    cart.items.find(
      (item) =>
        item.product.toString() === id && item.variant.toString() === variantId,
    )?.quantity || 0;

  if (itemQuantity + 1 > stock) {
    return res
      .status(400)
      .json({
        message: "Cannot increment quantity beyond available stock",
        success: false,
      });
  }

  await cartModel.findOneAndUpdate(
    { user: req.user._id, "items.product": id, "items.variant": variantId },
    { $inc: { "items.$.quantity": 1 } },
    { new: true },
  );

  return res.status(200).json({
    message: "Cart quantity increased successfully",
    success: true,
  });
};

export const decrementCartQuantity = async (req, res) => {
  try {
    const { id, variantId } = req.params;

    const product = await productModel.findOne({
      _id: id,
      "variants._id": variantId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product or variant not found",
        success: false,
      });
    }

    const cart = await cartModel.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        success: false,
      });
    }

    const cartItem = cart.items.find(
      (item) =>
        item.product.toString() === id && item.variant.toString() === variantId,
    );

    if (!cartItem) {
      return res.status(404).json({
        message: "Item not found in cart",
        success: false,
      });
    }

    if (cartItem.quantity <= 1) {
      return res.status(400).json({
        message: "Cannot decrement quantity below 1",
        success: false,
      });
    }

    const updatedCart = await cartModel.findOneAndUpdate(
      {
        user: req.user._id,
        items: {
          $elemMatch: {
            product: id,
            variant: variantId,
            quantity: { $gt: 1 },
          },
        },
      },
      {
        $inc: { "items.$.quantity": -1 },
      },
      {
        new: true,
      },
    );

    if (!updatedCart) {
      return res.status(409).json({
        message: "Cart item could not be updated. Please try again.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Cart quantity decreased successfully",
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error decrementing cart quantity:", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const checkoutController = async (req, res) => {

  const cart = await getCartDetails(req.user._id);

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      message: "Cart is empty. Cannot proceed to checkout.",
      success: false,
    });
  }

  const order = await checkout({ amount: cart.totalPrice, currency: cart.currency });  

  return res.status(200).json({
    message: "Checkout initiated successfully",
    success: true,
    order,
  });

}

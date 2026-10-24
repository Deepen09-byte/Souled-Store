import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockCheck } from "../dao/product.dao.js";

export const addToCart = async (req, res) => {

    const { id, variantId } = req.params;

    const { quantity = 1 } = req.body;

    const product = await productModel.findOne({ _id: id, "variants._id": variantId }); 

    if (!product) {
        return res.status(404).json({ message: "Product or variant not found", success: false });
    }

    const stock = await stockCheck(id, variantId, 1);

    const cart = (await cartModel.findOne({ user: req.user._id })) || (await cartModel.create({ user: req.user._id}));

    const isProductInCart = cart.items.some(item => item.product.toString() === id && item.variant.toString() === variantId);

    if (isProductInCart) {
        const quantityInCart = cart.items.find(item => item.product.toString() === id && item.variant.toString() === variantId).quantity;

        if (quantityInCart + quantity > stock) {
            return res.status(400).json({ message: "Cannot add more items than available in stock", success: false });
        }

        await cartModel.findOneAndUpdate(
            { user: req.user._id, "items.product": id, "items.variant": variantId },
            { $inc: { "items.$.quantity": quantity } },
            { new: true }
        );

        return res.status(200).json({ message: "Product quantity updated in cart", success: true });
    }   

    if (quantity > stock) {
        return res.status(400).json({ message: "Cannot add more items than available in stock", success: false });
    }

    cart.items.push({
        product: id,
        variant: variantId,
        quantity,
        price: product.price
    });

    await cart.save();  

    return res.status(201).json({ message: "Product added to cart", success: true });



}

export const getCart = async (req, res) => {

    const user = req.user;

    let cart = await cartModel.findOne({ user: user._id }).populate("items.product")

    if (!cart) {
        cart = await cartModel.create({ user: user._id, items: [] });
    }

    return res.status(200).json({ message: "Cart retrieved successfully", success: true, cart });
    
}

export const incrementCartQuantity = async (req, res) => {
    const { id, variantId } = req.params;

    const product = await productModel.findOne({ _id: id, "variants._id": variantId });

    if (!product) {
        return res.status(404).json({ message: "Product or variant not found", success: false });
    }

    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
        return res.status(404).json({ message: "Cart not found", success: false });
    }

    const stock = await stockCheck(id, variantId, 1);

    const itemQuantity = cart.items.find(item => item.product.toString() === id && item.variant.toString() === variantId)?.quantity || 0;

    if (itemQuantity + 1 > stock) {
        return res.status(400).json({ message: "Cannot increment quantity beyond available stock", success: false });
    }

    await cartModel.findOneAndUpdate(
        { user: req.user._id, "items.product": id, "items.variant": variantId },
        { $inc: { "items.$.quantity": 1 } },
        { new: true }
    );  
}


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
        item.product.toString() === id &&
        item.variant.toString() === variantId
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
      }
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

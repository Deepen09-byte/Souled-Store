import cartModel from "../models/cart.model.js";
import mongoose from "mongoose";

export async function getCartDetails(userId) {
  let [cart] = await cartModel.aggregate([
      {
        $match: {
          user: userId,
        },
      },

      // Preserve the cart even if items is empty
      {
        $unwind: {
          path: "$items",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Find the product for each cart item
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productData",
        },
      },

      {
        $unwind: {
          path: "$productData",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Find the matching variant inside the product
      {
        $addFields: {
          variantData: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$productData.variants", []] },
                  as: "variant",
                  cond: {
                    $eq: ["$$variant._id", "$items.variant"],
                  },
                },
              },
              0,
            ],
          },
        },
      },

      // Calculate each item's total price
      {
        $addFields: {
          itemTotal: {
            $multiply: [
              { $ifNull: ["$items.quantity", 0] },
              {
                $ifNull: [
                  "$variantData.price.amount",
                  "$items.price.amount",
                ],
              },
            ],
          },
          itemCurrency: {
            $ifNull: [
              "$variantData.price.currency",
              "$items.price.currency",
            ],
          },
        },
      },

      // Rebuild the cart
      {
        $group: {
          _id: "$_id",
          user: { $first: "$user" },

          totalPrice: {
            $sum: "$itemTotal",
          },

          currency: {
            $first: "$itemCurrency",
          },

          items: {
            $push: {
              $cond: [
                { $ifNull: ["$items.product", false] },
                {
                  _id: "$items._id",
                  product: "$productData",
                  variant: "$variantData",
                  quantity: "$items.quantity",
                  price: {
                    amount: {
                      $ifNull: [
                        "$variantData.price.amount",
                        "$items.price.amount",
                      ],
                    },
                    currency: {
                      $ifNull: [
                        "$variantData.price.currency",
                        "$items.price.currency",
                      ],
                    },
                  },
                },
                null,
              ],
            },
          },
        },
      },

      // Remove null entries for empty carts
      {
        $project: {
          _id: 1,
          user: 1,
          totalPrice: 1,
          currency: { $ifNull: ["$currency", "INR"] },
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: { $ne: ["$$item", null] },
            },
          },
        },
      },
    ]);

    return cart
}
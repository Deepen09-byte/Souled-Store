import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const cartSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            variant: {
                type: mongoose.Schema.Types.ObjectId,   
                ref: "Product.variants",
            },
            price: {
                type: priceSchema,
                required: true
            }
        }
    ]
}, { timestamps: true });

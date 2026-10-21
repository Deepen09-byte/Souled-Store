import productModel from "../models/product.model.js";


export const stockCheck = async (productId, variantId, quantity) => {
    const product = await productModel.findOne({ _id: productId, "variants._id": variantId });

    const stock = product.variants.find(variant => variant._id.toString() === variantId).stock;

    return stock ;
}
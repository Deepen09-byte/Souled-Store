import productModel from "../models/product.model.js";
import {uploadFile} from "../services/storage.service.js";

export async function createProduct(req, res) {

    const { title, description, priceAmount, priceCurrency } = req.body;
    const seller = req.user

    const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({buffer: file.buffer, fileName: file.originalname})
    }))

    const product = await productModel.create({
        title,
        description,
        price: {
            amount: priceAmount,
            currency: priceCurrency || "INR"
        },
        images,
        seller: seller._id
    })

    res.status(201).json({
        message: "Product created successfully",
        success: true,
        product
    })
}

export async function getSellerProducts(req, res) {
    const seller = req.user;

    const products = await productModel.find({ seller: seller._id });
    
    res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
    
}

export async function getAllProducts(req, res) {
    const products = await productModel.find()

    return res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })

}

export async function getProductDetails(req, res) {
    const { id } = req.params;

    const product = await productModel.findById(id)

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    return res.status(200).json({
        message: "Product fetched successfully",
        success: true,
        product
    })
}
export async function addVariant(req, res) {
    try {
        const { id } = req.params;
        const { priceAmount, priceCurrency, stock, attributes } = req.body;
        
        const product = await productModel.findOne({ _id: id, seller: req.user._id });
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        let images = [];
        if (req.files && req.files.length > 0) {
            images = await Promise.all(req.files.map(async (file) => {
                return await uploadFile({ buffer: file.buffer, fileName: file.originalname });
            }));
        } else if (req.body.imageUrl) {
            images = [{ url: req.body.imageUrl }];
        }

        let parsedAttributes = attributes;
        if (typeof attributes === "string") {
            try {
                parsedAttributes = JSON.parse(attributes);
            } catch (e) {
                parsedAttributes = {};
            }
        }

        const newVariant = {
            images,
            stock: Number(stock) || 0,
            attributes: parsedAttributes || {},
            price: {
                amount: Number(priceAmount) || product.price?.amount || 0,
                currency: priceCurrency || product.price?.currency || "INR"
            }
        };

        product.variants.push(newVariant);
        await product.save();

        return res.status(201).json({
            message: "Variant added successfully",
            success: true,
            product,
            variant: product.variants[product.variants.length - 1]
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}

export async function updateVariantStock(req, res) {
    try {
        const { id, variantId } = req.params;
        const { stock } = req.body;

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({ message: "Variant not found", success: false });
        }

        variant.stock = Math.max(0, Number(stock));
        await product.save();

        return res.status(200).json({
            message: "Stock updated successfully",
            success: true,
            product,
            variant
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}

export async function deleteVariant(req, res) {
    try {
        const { id, variantId } = req.params;

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        product.variants.pull({ _id: variantId });
        await product.save();

        return res.status(200).json({
            message: "Variant deleted successfully",
            success: true,
            product
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}

import express from "express";
import { authSeller } from "../middlewares/auth.middleware.js";
import {
    createProduct,
    getSellerProducts,
    getProductDetails,
    getAllProducts,
    addVariant,
    updateVariantStock,
    deleteVariant
} from "../controllers/product.contorller.js";
import { createProductValidator } from "../validators/product.validator.js";
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    }
});

const router = express.Router();

router.post("/", authSeller, upload.array('images', 4), createProductValidator, createProduct);
router.get("/seller", authSeller, getSellerProducts);
router.get("/", getAllProducts);
router.get("/details/:id", getProductDetails);

// Variant Management
router.post("/:id/variants", authSeller, upload.array('images', 4), addVariant);
router.patch("/:id/variants/:variantId/stock", authSeller, updateVariantStock);
router.delete("/:id/variants/:variantId", authSeller, deleteVariant);

export default router;

import express from "express";
import {authSeller} from "../middlewares/auth.middleware.js";
import { createProduct,getSellerProducts  } from "../controllers/product.contorller.js";
import { createProductValidator } from "../validators/product.validator.js";
import multer from "multer";

const upload = multer ({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    }
})

const router = express.Router();

router.post("/", authSeller, createProductValidator, upload.array('images', 4), createProduct);

router.get("/seller",authSeller, getSellerProducts); 
export default router;
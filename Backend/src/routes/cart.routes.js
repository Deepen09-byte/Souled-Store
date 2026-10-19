import express from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import { addToCartValidator } from "../validators/cart.validator.js";
import { addToCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/add/:id/:variantId", authUser ,addToCartValidator ,addToCart);

export default router;
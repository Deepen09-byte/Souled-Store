import express from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import { addToCartValidator } from "../validators/cart.validator.js";
import { addToCart ,getCart} from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/add/:id/:variantId", authUser ,addToCartValidator ,addToCart);

router.get("/", authUser, getCart);

export default router;
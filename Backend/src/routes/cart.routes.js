import express from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import { addToCartValidator, validateIncrementQuantity } from "../validators/cart.validator.js";
import { addToCart ,getCart, incrementCartQuantity} from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/add/:id/:variantId", authUser ,addToCartValidator ,addToCart);

router.get("/", authUser, getCart);

router.patch("/quantity/increment/:id/:variantId", authUser, validateIncrementQuantity, incrementCartQuantity);

export default router;
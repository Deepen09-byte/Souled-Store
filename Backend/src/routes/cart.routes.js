import express from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import { addToCartValidator, validateIncrementQuantity, validatedecrementQuantity } from "../validators/cart.validator.js";
import { addToCart ,getCart, incrementCartQuantity, decrementCartQuantity} from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/add/:id/:variantId", authUser ,addToCartValidator ,addToCart);

router.get("/", authUser, getCart);

router.patch("/quantity/increment/:id/:variantId", authUser, validateIncrementQuantity, incrementCartQuantity);

router.patch("/quantity/decrement/:id/:variantId", authUser, validatedecrementQuantity, decrementCartQuantity)

export default router;
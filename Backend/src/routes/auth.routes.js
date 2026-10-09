import { Router } from "express";
import { validateRegister, validateLogin } from "../validators/auth.validator.js";
import { register, login, googleCallback, getMe } from "../controllers/auth.controller.js";
import passport from "passport";
import{ config }from "../config/config.js";
import { authUser } from "../middlewares/auth.middleware.js";


const router = Router();

router.post("/register", validateRegister,register );

router.post("/login", validateLogin, login);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect:config.NODE_ENV == "developement" ? "http://localhost:5173/login" : "/login" }, googleCallback));

router.get("/me", authUser, getMe);

export default router;
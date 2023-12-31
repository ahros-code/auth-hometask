import {Router} from "express";
import authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/forgot", authController.forgotPassword)
router.post("/new-password", authController.newPassword)
router.get("/activate/:link", authController.activate)

export default router;
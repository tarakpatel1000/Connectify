import express from "express";
import { freezeAccount, getSuggestedUsers, signupUser } from "../controllers/userController.js";
import { loginUser } from "../controllers/userController.js";
import { logout } from "../controllers/userController.js";
import { followUnfollowUser } from "../controllers/userController.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { updateUser } from "../controllers/userController.js";
import { getUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.put("/update/:id", protectRoute, updateUser);
router.put("/freeze", protectRoute, freezeAccount);

export default router;
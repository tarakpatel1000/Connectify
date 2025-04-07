import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getConversations, sendMessage, getMessages } from "../controllers/messageController.js";

const router = express.Router();


router.get("/conversations", protectRoute, getConversations);
router.post("/", protectRoute, sendMessage);
router.get("/:otherUserID", protectRoute, getMessages);

export default router;

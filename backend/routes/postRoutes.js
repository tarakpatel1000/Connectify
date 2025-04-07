import express from "express";
import { createPost } from "../controllers/postController.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { getPosts } from "../controllers/postController.js";
import { deletePost } from "../controllers/postController.js";
import { likeUnlikePost } from "../controllers/postController.js";
import { replyToPost } from "../controllers/postController.js";
import { getFeedPosts } from "../controllers/postController.js";
import { getUserPosts } from "../controllers/postController.js";

const router = express.Router();

router.get("/feed", protectRoute, getFeedPosts);
router.get("/:postId", getPosts);
router.get("/user/:username", getUserPosts);
router.post("/create", protectRoute, createPost);
router.delete("/:postId", protectRoute, deletePost);
router.put("/like/:postId", protectRoute, likeUnlikePost);
router.put("/reply/:postId", protectRoute, replyToPost);

export default router;
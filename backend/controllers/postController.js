import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import {v2 as cloudinary} from "cloudinary";

export const createPost = async (req, res) => {
    try {
        const { postedBy, text } = req.body;
        let {img} = req.body;

        if(!postedBy || !text) {
            return res.status(400).json({error : "Postedby and text fields are required"});
        }

        const user = await User.findById(postedBy);
        if(!user) {
            return res.status(404).json({error : "User not found"});
        }

        if(user._id.toString() !== req.user._id.toString()) {
            return res.status(400).json({error : "Unauthorized to create post"});
        }

        const maxLength = 500;
        if(text.length > 500) {
            return res.status(400).json({error : "Text length should not exceed 500 characters"});
        }

        if(img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
                        img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            postedBy,
            text,
            img
        })

        await newPost.save();
        res.status(201).json(newPost)
    } catch (error) {
        console.log("createPost function error");
        res.status(500).json({error : error.message})
    }
}

export const getPosts = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if(!post) {
            res.status(404).json({error : "Post not found"});
            return;
        }

        res.status(200).json(post);
    } catch (error) {
        console.log("getPosts function error");
        res.status(500).json({error : error.message});
    }
}

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({error : "Post not found"});
        }

        if(post.postedBy._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({error : "Unauthorize to delete post"});
        } 

        if(post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({message : "Post has been deleted Successfully"});
        
    } catch (error) {
        console.log("deletePost function error");
        res.status(500).json({error : error.message});
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const {postId} = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({error : "Post not found"});
        }

        const userLikedPost = post.likes.includes(userId);
        if(userLikedPost) {
            //unliking the post
            await Post.updateOne({_id : postId}, {$pull : {likes : userId}});
            res.status(200).json({message : "Post unliked successfully"});
        } else {
            //liking the post
            post.likes.push(userId);
            await post.save();
            res.status(200).json({message : "Post liked successfully"});
        }
        
    } catch (error) {
        console.log("likeUnlikePost function error");
        res.status(500).json({error : error.message});
    }
}

export const replyToPost = async (req, res) => {
    try {
        const {text} = req.body;
        const {postId} = req.params;
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
        const username = req.user.username;

        if(!text) {
            return res.status(400).json({error : "text field is required"});
        }

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({error : "post not found"});
        }

        const reply = {userId, text, userProfilePic, username}
        post.replies.push(reply);
        await post.save();

        res.status(200).json(reply)
    } catch (error) {
        console.log("replyToPost function error");
        res.status(500).json({error : error.message})
    }
}

export const getFeedPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({error : "User not found"});
        }

        const following = user.following;
        const feedPosts = await Post.find({postedBy : {$in : following}}).sort({createdAt : -1});

        return res.status(200).json(feedPosts);
    } catch (error) {
        console.log("getFeedPosts function error");
        return res.status(500).json({error : error.message});
    }
}

export const getUserPosts = async (req, res) => {
    const {username} = req.params;
    try {
        const user = await User.findOne({username});
        if(!user) {
            return res.status(404).json({message : "User not found"});
        }

        const posts = await Post.find({postedBy : user._id}).sort({createdAt : -1})
        res.status(200).json(posts);
    } catch (error) {
        console.log("getUserPosts function error");
        res.status(500).json({error : error.message})
    }
}
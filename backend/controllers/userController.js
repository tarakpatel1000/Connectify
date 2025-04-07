import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookies from "../utils/helpers/generateTokenAndSetCookie.js";
import {v2 as cloudinary} from "cloudinary";
import mongoose from "mongoose";
import Post from "../models/postModel.js";

export const signupUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;
        if(!name || !email || !username || !password) {
            return res.status(400).json({ error: "All fields are mandatory" });
        }
        const user = await User.findOne({$or : [{email}, {username}]});

        if(user) {
            res.status(400).json({error : "User already exists"});
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            username,
            password : hashedPassword,
        });

        await newUser.save();

        if(newUser) {
            generateTokenAndSetCookies(newUser._id, res);
            res.status(201).json({
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio : newUser.bio,
                profilePic : newUser.profilePic,
            });
        }

    } catch (error) {
        res.status(500).json({error : error.message});
        console.log("Error is signUp user function");
    }
}

export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if(!username || !password) {
            res.status(500).json({error : "Username and password is mandatory"});
            return;
        }

        const user = await User.findOne({username});
        const isPaswordCorrect = await bcrypt.compare(password, user?.password || "");

        if(!user || !isPaswordCorrect) {
            res.status(500).json({error : "Invalid username or password"});
            return;
        }

        if(user.isFrozen) {
            user.isFrozen = false;
            await user.save();
        }

        generateTokenAndSetCookies(user._id, res);

        res.status(200).json({
            id : user._id,
            name : user.name,
            email : user.email,
            username : user.username,
            bio : user.bio,
            profilePic : user.profilePic
        });

    } catch (error) {
        res.status(500).json({error : error.message});
        console.log("Sign Up function error");
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("token", "", {maxAge : 1});
        res.status(200).json({message : "Logged out successfully"});
    } catch (error) {
        console.log("logout function error");
        res.status(500).json({error : error.message});
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id === req.user._id.toString()) {
           return res.status(400).json({error : "cannot folow/unfollow yourself"});
        }

        if(!userToModify || !currentUser) {
           return res.status(400).json({error : "User not found"});
        }

        const isFollowing = currentUser.following.includes(id);
        if(isFollowing) {
            //unfollow that
            await User.findByIdAndUpdate(req.user._id, {$pull : {following : id}})
            await User.findByIdAndUpdate(id, {$pull : { followers : req.user._id}})
            res.status(200).json({message : "User unfollowed successfuly"});
        } else {
            //follow that
            await User.findByIdAndUpdate(req.user._id, {$push : {following : id}})
            await User.findByIdAndUpdate(id, {$push : { followers : req.user._id}})
            res.status(200).json({message : "User followed successfully"});
        }
    } catch (error) {
        console.log("Follow Unfollow function error");
        res.status(500).json({error : error.message});
    }
}

export const updateUser = async (req, res) => {
    const { name, email, password, username, bio } = req.body;
    let {profilePic} = req.body;
    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if(!user) {
            return res.status(400).json({error : "User not found"});
        }

        if(req.params.id !== userId.toString()) {
            return res.status(400).json({error : "You cannot update other users profile"});
        }

        if(password) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            user.password = hashPassword;
        }

        if(profilePic) {
            if(user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();

        //Find all posts that this user replied and update username and userProfilePic fields
        await Post.updateMany(
            {"replies.userId" : userId},
            {$set : {
                "replies.$[reply].username" : user.username,
                "replies.$[reply].userProfilePic" : user.profilePic
            }},
            {
                arrayFilters : [{"reply.userId" : userId}]
            }
        )

        //password making null
        user.password = null;

        res.status(200).json({message : "User profile updated successfully", user});
    } catch (error) {
        console.log("updateUser function error")
        res.status(500).json({error : error.message})
    }
}

export const getUserProfile = async (req, res) => {
    try {
        //we will fetch user profile either with Username and UserID
        const {query} = req.params;
        let user;

        //if query is userId
        if(mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findOne({_id : query}).select("-password").select("-updatedAt");
        } else {
            //query is username
            user = await User.findOne({username : query}).select("-password").select("-updatedAt");
        }
        if(!user) {
            return res.status(400).json({error : "User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("getUserProfile function error");
        res.status(500).json({error : error.message})
    }
}

export const getSuggestedUsers = async(req, res) => {
    try {
        //exclude the current user from suggestedUsers array
        const currentUserId = req.user._id;

        const userFollowedByCurrentUser = await User.findById(currentUserId).select("following");
        const user = await User.aggregate([
            {
                $match : {
                    _id : {$ne : currentUserId}
                }
            },
            {
                $sample : {size : 10}
            }
        ]);

        //exclude the users that the current user is already following
        const filteredUsersThatWeFollow = user.filter((user) => !userFollowedByCurrentUser.following.includes(user._id));
        const suggestedUsers = filteredUsersThatWeFollow.slice(0,4);

        suggestedUsers.forEach((user) => user.password = null);

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log("getSuggestedUsers function error");
        res.status(500).json({error : error.message});
    }
}

export const freezeAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(!user) {
            return res.status(404).json({message : "User not found"});
        }

        user.isFrozen = true;
        await user.save();

        res.status(200).json({success : true});
    } catch (error) {
        console.log("Freeze account function error");
        res.status(500).json({error : error.message});
    }
}
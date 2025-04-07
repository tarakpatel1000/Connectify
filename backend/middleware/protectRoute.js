import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token) {
           return res.status(401).json({message : "Unauthorized"});
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decode.userId).select("-password");
        req.user = user;

        next();
    } catch (error) {
        console.log("Protect route function error");
        res.status(500).json({message : error.message})
    }
}
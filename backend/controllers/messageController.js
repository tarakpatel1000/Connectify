
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import {v2 as cloudinary} from "cloudinary";

export const sendMessage = async (req, res) => {
    try {
        const {recipientId, message} = req.body;
        let {img} = req.body;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants : {$all : [senderId, recipientId]}
        });

        if(!conversation) {
            conversation = new Conversation({
                participants : [senderId, recipientId],
                lastMessage : {
                    text : message,
                    sender : senderId
                }
            })
        }

        await conversation.save();

        if(img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;

        }

        const newMessage = new Message({
            conversationId : conversation._id,
            sender : senderId,
            text : message,
            img : img || ""
        })

        await Promise.all([
            newMessage.save(),
            conversation.updateOne({
                lastMessage : {
                    text : message,
                    sender : senderId,
                }
            })
        ])

        const receiverSocketId = getReceiverSocketId(recipientId);

        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({error : error.message});
    }
}

export const getMessages = async (req, res) => {
    try {
        const {otherUserID} = req.params;
        const senderId = req.user._id;
        if(!otherUserID) {
            return res.status(404).json({message : "User not found"});
        }

        const conversation = await Conversation.findOne({
            participants : {$all : [senderId, otherUserID]}
        })

        if(!conversation) {
            return res.status(404).json({message : "Conversation not found"})
        }

        const messages = await Message.find({
            conversationId : conversation._id
        }).sort({createdAt : 1})

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}

export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const conversations = await Conversation.find({participants : userId}).populate({
            path : "participants",
            select : "username profilePic"
        })

        //remove the current user from the participants list
        conversations.forEach(element => {
            element.participants = element.participants.filter((id) => id._id.toString() !== userId.toString());
        });
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({error : error.message})
    }
}
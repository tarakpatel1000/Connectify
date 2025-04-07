import {Server} from "socket.io";
import http from 'http';
import express from "express"
import Message from "../models/messageModel.js"

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin : "http://localhost:5173", //connecting to frontend
        methods : ["GET", "POST"] //accepting only get and post request
    }
});

export const getReceiverSocketId = (recipientId) => {
    return userSocketMap[recipientId]
}

const userSocketMap = {}; //userId : socketId
io.on("connection",(socket) => {
    console.log("User connected", socket.id);

    const userId = socket.handshake.query.userId;

    if(userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }

    socket.on("markMessagesAsSeen", async ({conversationId, userId}) => {
        try {
            await Message.updateMany({conversationId : conversationId, seen : false}, {$set : {seen : true}})
            io.to(userSocketMap[userId]).emit("messagesSeen", {conversationId});
        } catch (error) {
            console.log(error);
        }
    })

    io.emit("getOnlineUsers", Object.keys(userSocketMap))
    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
        delete userSocketMap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    });
});

export {io, server, app}
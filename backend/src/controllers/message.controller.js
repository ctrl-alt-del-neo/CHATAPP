import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const loggedInUserId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: loggedInUserId },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
    console.log(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadedResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

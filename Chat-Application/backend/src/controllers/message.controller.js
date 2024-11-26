import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    return res.status(200).json({ status: "success", users: filteredUsers });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    let { id: UserIdOfChat } = req.params;
    const UserId = req.user.id;
    const messages = await Message.find({
      $or: [
        { senderId: UserId, receiverId: UserIdOfChat },
        { senderId: UserIdOfChat, receiverId: UserId },
      ],
    });

    return res.status(200).json({ status: "success", messages });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;
    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({ senderId, receiverId, text, image: imageUrl });

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(200).json({ status: "success", newMessage });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

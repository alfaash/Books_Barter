const SwapRequest = require("../models/swapRequest");
const {StatusCodes} = require('http-status-codes')
const {BadRequestError,NotFoundError}=require('../errors')
const Chat = require("../models/chatSchema")
const Book = require("../models/Book");
const User = require("../models/User")

const getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name profilePhoto")
      .populate("messages.sender", "name") // optional: populate sender name
      .lean(); // improves performance for read-only

    const formattedChats = chats.map(chat => {
      const unreadCount = chat.messages.filter(
        msg => !msg.readBy.some(id => id.toString() === userId.toString())
      ).length;

      return {
        _id: chat._id,
        participants: chat.participants,
        lastMessage: chat.messages[chat.messages.length - 1] || null,
        unreadCount,
      };
    });

    res.json(formattedChats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getOrCreateChat = async (req, res) => {
  try {
    const { swapRequestId } = req.params;
    const swap = await SwapRequest.findById(swapRequestId)
      .populate("owner requester", "name profilePhoto");

    if (!swap) return res.status(404).json({ error: "Swap request not found" });

    let chat = await Chat.findOne({ swapRequest: swapRequestId });
    if (!chat) {
      chat = new Chat({
        swapRequest: swapRequestId,
        participants: [swap.owner._id, swap.requester._id],
        messages: []
      });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const sender = req.user.userId; // assuming middleware sets this

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    // Ensure sender is part of the chat
    const isParticipant = chat.participants.some(
      (p) => p.toString() === sender.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ error: "Not authorized" });
    }

    chat.messages.push({
      sender,
      message,
      readBy: [sender],
    });

    await chat.save();

    res.status(201).json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId)
      .populate("messages.sender", "name profilePhoto");

    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json(chat.messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    // Ensure user is part of this chat
    const isParticipant = chat.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // ✅ Mark all messages as read by this user
    chat.messages.forEach((msg) => {
      if (!msg.readBy.some((id) => id.toString() === userId.toString())) {
        msg.readBy.push(userId);
      }
    });

    await chat.save();

    res.json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




module.exports = {getUserChats,getOrCreateChat,sendMessage,getMessages,markMessagesAsRead};
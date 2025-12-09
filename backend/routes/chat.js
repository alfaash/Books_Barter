const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authentication");
const {getUserChats,getMessages,getOrCreateChat,sendMessage,markMessagesAsRead} = require("../controllers/chat");

router.get("/",authMiddleware, getUserChats);
router.get("/:chatId",authMiddleware, getMessages);
router.post("/:swapRequestId",authMiddleware, getOrCreateChat);
router.post("/:chatId/message",authMiddleware, sendMessage);
router.put("/:chatId/read", authMiddleware, markMessagesAsRead);

module.exports = router;

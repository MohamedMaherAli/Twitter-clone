const express = require('express');
const router = express.Router();
const chatsController = require('../../controllers/apiController/chatsApiController');
const { requireLogin } = require('../../middleware/session-middlware');

router.post("/api/chats", requireLogin, chatsController.postChatData);

router.get("/api/chats", requireLogin, chatsController.getChatData);

router.get("/api/chats/:chatId/messages", requireLogin, chatsController.getChatMessages);

router.put("/api/chats/:chatId/messages/markAsRead", requireLogin, chatsController.putMessagesAsRead)


module.exports = router;
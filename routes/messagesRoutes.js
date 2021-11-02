const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/session-middlware');
const messagesController = require('../controllers/messagesController');

router.get('/messages', requireLogin, messagesController.getMessagePage)

router.get('/messages/new', requireLogin, messagesController.getNewMessagePage);

router.get('/messages/:id', requireLogin, messagesController.getChatPage);

module.exports = router;
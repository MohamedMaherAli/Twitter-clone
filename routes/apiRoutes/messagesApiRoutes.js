const express = require('express');
const router = express.Router();
const messagesController = require('../../controllers/apiController/messagesApiController');
const { requireLogin } = require('../../middleware/session-middlware');

router.post("/api/messages", requireLogin, messagesController.postMessage);



module.exports = router;
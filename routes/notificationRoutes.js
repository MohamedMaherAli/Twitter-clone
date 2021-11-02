const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/session-middlware');
const notificationController = require('../controllers/notificationController');

router.get('/notification', requireLogin, notificationController.getCotificationPage);


module.exports = router;
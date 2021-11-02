const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/apiController/notificationsApiController');
const { requireLogin } = require('../../middleware/session-middlware');

router.get("/api/notifications", requireLogin, notificationController.getNotification);

router.put('/api/notifications/:id/markAsOpened', requireLogin, notificationController.putNotificationMarkAsOpened);

router.put('/api/notifications/markAsOpened', requireLogin, notificationController.putAllNotificationsAsOpened);

router.get("/api/notifications/latest", requireLogin, notificationController.getLatestNotification);

module.exports = router;
const Notification = require('../../models/notificationSchema');


exports.getNotification = async (req, res) => {

  let searchObj = {userTo: req.session.user._id, notificationType: {$ne: "newMessage"}};
  if(req.query.unreadOnly && req.query.unreadOnly == "true") {
    searchObj.opened = false;
  }

  const results = await Notification.find(searchObj)
  .populate("userTo")
  .populate("userFrom")
  .sort({createdAt: 1})
  .catch(e => {
    console.log(e);
    res.sendStatus(400);
  });

  res.status(200).send(results);
}

exports.putNotificationMarkAsOpened = async (req, res) => {
  const notificationId = req.params.id;
  await Notification.findByIdAndUpdate(notificationId, {opened: true});
  res.sendStatus(204);
}

exports.putAllNotificationsAsOpened = async (req, res) => {
  const notificationId = req.params.id;
  await Notification.updateMany({userTo: req.session.user._id} , {opened: true});
  res.sendStatus(204);
}

exports.getLatestNotification = async (req, res) => {
  const results = await Notification.findOne({userTo: req.session.user._id})
  .populate("userTo")
  .populate("userFrom")
  .sort({createdAt: 1})
  .catch(e => {
    console.log(e);
    res.sendStatus(400);
  });
  res.status(200).send(results);
}
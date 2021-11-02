const mongoose = require('mongoose');

const {Schema} = mongoose;

const notificationSchema = new Schema({
  userTo: { type: Schema.Types.ObjectId, ref : 'User' },
  userFrom: { type: Schema.Types.ObjectId, ref : 'User' },
  notificationType : {type: String},
  opened: {type: Boolean, default: false},
  entityId : {type: Schema.Types.ObjectId}
},{ timestamps: true });


notificationSchema.statics.insertNotification = async (userTo, userFrom, notificationType, entityId) => {
  let data = {
    userTo,
    userFrom,
    notificationType,
    entityId
  }

  await Notification.deleteOne(data).catch(e => console.log(e));
  const notification = new Notification(data);
  await notification.save();
  return notification;
}

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

exports.getCotificationPage = (req, res) => {
  res.render('notificationsPage', {
    pageTitle: "Notifications",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  });
}
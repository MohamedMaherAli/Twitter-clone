exports.getHomePage = async (req, res) => {
  const payLoad = {
    pageTitle : "Home",
    userLoggedIn : req.session.user,
    userLoggedInJs : JSON.stringify( req.session.user)
  }
  res.status(200).render("home", payLoad)
}
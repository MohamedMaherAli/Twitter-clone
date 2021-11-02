

exports.getSearchPage = async (req, res) => {
  const userLoggedIn = req.session.user;
  const payLoad = createPayLoad(userLoggedIn);
  payLoad.selectedTab = 'posts';
  res.render('searchPage', payLoad);
}

exports.getSelectedTab = async (req, res) => {
  const userLoggedIn = req.session.user;
  const payLoad = createPayLoad(userLoggedIn);
  const selectedTab = req.params.selectedTab;
  payLoad.selectedTab = selectedTab;
  res.render('searchPage', payLoad);
}



function createPayLoad(userLoggedIn) {
  return {
    pageTitle: "Search",
    userLoggedIn: userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn)
  }
}

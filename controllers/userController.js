const User = require('../models/userSchema');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');


// Login Page
exports.getLoginPage = (req, res) => {
  res.status(200).render("login"); 
}

// Register Page
exports.getRegisterPage = (req, res) => {
  res.status(200).render("register"); 
}

// Handle Register 
exports.postRegisterPage = async (req, res) => {
    let {firstName, lastName, username, email, password, passwordConf } = req.body;
    const payLoad = req.body;
    const {errors} = validationResult(req);
    if(errors.length > 0) {
      let messages = [];
      errors.forEach((e) => messages.push(e.msg));
      payLoad.errorMessage = messages.join("_");
      return res.render('register', payLoad);
    }

    //Check user is already registered
    const userFound = await User.findOne({
      $or :[
        {email},
        {username}
      ]
    });
    if(userFound !== null) {
      payLoad.errorMessage = "Email or password are in use";
      return res.render('register', payLoad);
    }

    //check password match
    if(password !== passwordConf) {
      // errors.push({msg : "Passwords must match"});  
      payLoad.errorMessage = "Passwords dont match";
      return res.render('register', payLoad); 
    }
    
    //Registering the user
    const hashedPassword =  await bcrypt.hash(password, 10);
    password = hashedPassword;
    const user =  new User({firstName, lastName, username, email, password});
    await user.save();
    req.session.user = user;
    res.redirect('/');
}


// Handle login
exports.postLoginPage = async (req, res) => {
  const {logUsername, logPassword} = req.body;
  const payLoad = req.body;
  const user = await User.findOne({
    $or : [
      {username: logUsername},
      {email: logUsername}
    ]
  });

  if(!user) {
    payLoad.errorMessage = "incorrect username or email";
    return res.render('login', payLoad);
  }else {
    const correctPassword = await bcrypt.compare(logPassword, user.password);
    if(!correctPassword) {
      payLoad.errorMessage = "Incorrect Password";
      return res.render('login', payLoad);
    }
    req.session.user = user;
    return res.redirect('/');
  }
}

// Handle logout
exports.getLogout = (req, res) => {
  if(req.session) {
    req.session.destroy(() =>{
      res.redirect('/login');
    })
  }
}
var express = require('express');
var router = express.Router();
const userModel = require('./users.js');
const postModel = require('./post.js');
const localStrategy = require('passport-local');
const passport = require('passport');
passport.use(new localStrategy(userModel.authenticate()));
const upload = require('./multer.js');

router.get('/', function (req, res, next) {
  res.render('index', { nav: false });
});

router.get('/register', function (req, res, next) {
  res.render('register', { nav: false }); // page show ho rha haan
});

router.get('/add', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render('add', { user, nav: true }); // page show ho rha haan
});

router.post('/createpost', isLoggedIn, upload.single("postimage"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');// page show ho rha haan
});

router.get('/profile', isLoggedIn, async function (req, res, next) {
  const user =
    await userModel
      .findOne({ username: req.session.passport.user })
      .populate('posts'); //sari post user ka sath populate ho rhi haan ajaygi
  res.render('profile', { user, nav: true }); // page show ho rha haan
});

router.get('/show/posts', isLoggedIn, async function (req, res, next) {
  const user =
    await userModel
      .findOne({ username: req.session.passport.user })
      .populate('posts'); //sari post user ka sath populate ho rhi haan ajaygi
  res.render('show', { user, nav: true }); // page show ho rha haan
});

router.get('/feed', isLoggedIn, async function (req, res, next) {
  // const user = await userModel.findOne({ username: req.session.passport.user })
  // const posts = await postModel.find({}).populate("user") //sari post user ka sath populate ho rhi haan ajaygi
  // res.render('feed', { user, posts, nav: true }); // page show ho rha haan
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const posts = await postModel.find().populate("user");
    res.render('feed', { user, posts, nav: true });
  } catch (error) {
    console.error("Error in /feed route:", error);
    next(error); // Pass the error to the next middleware for handling
  }
  
});

router.post('/fileupload', isLoggedIn, upload.single("image"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

router.post('/register', function (req, res, next) {
  const data = new userModel({
    username: req.body.username, // register page ka  input name sa map karne chahya
    contact: req.body.contact,
    email: req.body.email,
    name: req.body.name,
  }); // data save ho rha haan
  userModel.register(data, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/',
}), function (req, res, next) {

});

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
}); //logout and check logout

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const secure = require('../config/passport.config');
const secmiddleware = require('../middlewares/security.middleware');
const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.jpg') //Appending .jpg
  }
})

const uploader = multer({ storage: storage });

router.get('/profile', secure.isAuthenticated, userController.profile);

router.get('/user/edit/:id', userController.editProfile);
router.post('/user/edit/:id', uploader.single('img'), userController.doEdit);

// router.get('/delete/:id', userController.delete);


module.exports = router;
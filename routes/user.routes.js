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

router.get('/profile', secure.isAuthenticated, userController.showProfile);

router.get('/user/edit/:id', userController.editProfile);
router.post('/user/edit/:id', uploader.single('profileImg'), userController.doEdit);

router.get('/user/list',secure.isAuthenticated, userController.list);

router.get('/user/delete/:id', userController.delete);

router.get('/user/admin/:id', secmiddleware.isAdmin, userController.makeAdmin);
router.post('/recipe/fav', secure.isAuthenticated, userController.addFav);
router.get('/user/favs', secure.isAuthenticated, userController.showFavs);

module.exports = router;
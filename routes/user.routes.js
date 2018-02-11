const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const secure = require('../config/passport.config');
const secmiddleware = require('../middlewares/security.middleware');
const multer = require('multer');
const uploader = multer({dest:'./public/uploads'});

router.get('/profile', secure.isAuthenticated, userController.profile);

router.get('/edit/:id', userController.editProfile);
router.post('/edit/:id', uploader.single('img'), userController.doEdit);

// router.get('/delete/:id', userController.delete);


module.exports = router;
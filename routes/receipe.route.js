const express = require('express');
const router = express.Router();
const receipeController = require('../controllers/receipe.controller');
const passport = require('passport');
//const secure = require('../configs/passport.config');

router.get('/', receipeController.show);
router.get('/:id', receipeController.showOne);

router.get('/create', receipeController.create);
router.post('/create', receipeController.doCreate);

//router.get('/edit/:id', receipeController.edit);
//router.post('/edit/:id', receipeController.doEdit);

//router.post('/delete/:id', receipeController.doDelete);

module.exports = router;
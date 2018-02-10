const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const passport = require('passport');
const secure = require('../config/passport.config');
const multer = require('multer');
const uploader = multer({dest:'./public/uploads'});

router.get('/', recipeController.show);
router.get('/recipes/:id', recipeController.showOne);

router.get('/create', secure.isAuthenticated, recipeController.create);
router.post('/search', recipeController.search);
router.post('/recipes/create', uploader.single('img'), recipeController.doCreate);

router.get('/edit/:id', recipeController.edit);
router.post('/recipes/edit/:id', uploader.single('img'), recipeController.doEdit);

//router.post('/delete/:id', receipeController.doDelete);

module.exports = router;


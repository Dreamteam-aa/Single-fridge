const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const passport = require('passport');
const secure = require('../config/passport.config');

router.get('/', recipeController.show);
router.get('/recipes/:id', recipeController.showOne);

router.get('/create', secure.isAuthenticated, recipeController.create);
router.post('/search', recipeController.search);
router.post('/recipes/create', recipeController.doCreate);

router.get('/edit/:id', recipeController.edit);
router.post('/edit/:id', recipeController.doEdit);

//router.post('/delete/:id', receipeController.doDelete);

module.exports = router;


const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const passport = require('passport');
const secure = require('../config/passport.config');

router.get('/', recipeController.show);
router.get('/recipes/:id', recipeController.showOne);

router.get('/create', recipeController.create);
router.post('/recipes/create', recipeController.doCreate);

//router.get('/edit/:id', receipeController.edit);
//router.post('/edit/:id', receipeController.doEdit);

//router.post('/delete/:id', receipeController.doDelete);

module.exports = router;
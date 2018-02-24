const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const passport = require('passport');
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

router.get('/', recipeController.show);

router.get('/recipes/searchapi', recipeController.searchRecipe);
router.get('/recipes/recipe/:id', recipeController.showOne);

router.get('/create', secure.isAuthenticated, recipeController.create);
router.post('/search', recipeController.search2);
router.post('/recipes/create', uploader.single('img'), recipeController.doCreate);

router.get('/edit/:id', secmiddleware.isAuthor, recipeController.edit);
router.post('/recipes/edit/:id', uploader.single('img'), recipeController.doEdit);

router.get('/delete/:id', recipeController.delete);

router.get('/addapi', recipeController.searchRecipe);
router.post('/resultsapi', recipeController.findResults);

router.post('/recipe/rate', secure.isAuthenticated, recipeController.rate);
module.exports = router;


const mongoose = require('mongoose');
const Recipe = require('../models/recipe.model');
const Ingredient = require('../models/ingredient.model');
const User = require('../models/user.model');
const passport = require('passport');

module.exports.isAuthor = (req, res, next) => {
    Recipe.findById(req.params.id).then((recipe) => {
        if( recipe.author.equals(req.user._id) ){
            console.log("hola");
            next();
        } else {
            res.redirect("/");
        }
      }); 
}
const mongoose = require('mongoose');
const Recipe = require('../models/recipe.model');
const Ingredient = require('../models/ingredient.model');
const User = require('../models/user.model');
const passport = require('passport');
require('isomorphic-fetch'); // or another library of choice.
var Dropbox = require('dropbox').Dropbox;
const _ = require('underscore');
var fs = require('fs');
var path = require('path');
var prompt = require('prompt');
const ACCESS_TOKEN_DB = "2iy2FNkeNWYAAAAAAAAA5tHBa8ANCECRZdM4uioQC0Oh3JHXjNbL9d3ECz292NWp";

module.exports.show = (req, res, next) => {
    Recipe.find()
        .populate('author')
        .sort({ createdAt: -1 })
        .then((recipes) => {
            if(recipes.length > 0){
                console.log(recipes);
                res.render('recipes/show', {
                    recipes: recipes,
                });
            } else {
                res.render('recipes/show');
            }
        })
        .catch(error => next(error));
}

module.exports.showOne = (req, res, next) => {
    Recipe.findById(req.params.id).then((recipe) => {
         res.render('recipe/show', {
           recipes: recipes
         });
       }); 
}

module.exports.edit = (req, res, next) => {
    Recipe.findById(req.params.id)
    .populate('ingredients.ingredient')
    .then((recipe) => {
         res.render('recipes/edit', {
           recipe: recipe
         });
       }); 
}

module.exports.doEdit = (req, res, next) => {
    Recipe.findById(req.params.id).then((recipe) => {
         res.render('recipe/edit', {
           recipes: recipes
         });
       }); 
}

module.exports.search = (req, res, next) => {
    const ingredients = req.body.ingredients.split(",");
    Recipe.find( { 'ingredients.ingredient':{ $all : ingredients} })
        .then(recipes => {
            if( recipes.length > 0 ){
                console.log(recipes);
                res.render('recipes/search', {
                recipes: recipes,
                ingredients: ingredients
                });
            } else {
                res.render('recipes/search', {
                    recipes: recipes,
                    ingredients: ingredients,
                    errors: {
                        text: "We could not find any recipes including these ingredients."
                    } 
                    });
            }
            
        })
        .catch(error => next(error));
    

}

module.exports.create = (req, res, next) => {
    res.render('recipes/new'); 
}

module.exports.doCreate = (req, res, next) => {
    const ingredientsIds = [];
    ingredients = req.body.ingredients.split(",");
    recipes = req.body.name;
    console.log(req.files);
    var dbx = new Dropbox({ accessToken: ACCESS_TOKEN_DB });
    fs.readFile(path.join(__dirname, req.body.img), 'utf8', function (err, contents) {
    if (err) {
      console.log('Error: ', err);
    }
    // This uploads basic.js to the root of your dropbox
    dbx.filesUpload({ path: req.body.img, contents: contents })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (err) {
        console.log(err);
      });
  });
    recipe = new Recipe({
       name: req.body.name,
       description: req.body.description,
       author: req.user._id
      });
    recipe.save()
        .then((savedRecipe) => {
            ingredients.forEach(element => {
                ing = new Ingredient({
                    name: element
                });
              Ingredient.findOne({ name: element })
                .then(ing => {
                    if (ing != null) {
                        Recipe.findByIdAndUpdate(savedRecipe._id, { $push: { ingredients: { ingredient: ing.name }}})
                                .then(() =>  next());
                        next();
                    } else {
                        ing = new Ingredient({
                            name: element
                        });
                        ing.save()
                        .then((savedIng) => {
                            Recipe.findByIdAndUpdate(savedRecipe._id, { $push: { ingredients: { ingredient: savedIng.name }}})
                                .then(() =>  next());
                        })
                        .catch(error => {
                            if (error instanceof mongoose.Error.ValidationError) {
                                res.render('recipes/new', { 
                                    recipes: recipes,
                                    error: error.errors 
                                });
                            } else {
                                next(error);
                            }
                        });
                 }
                }).catch(error => next(error));
            });
          res.redirect('/profile');
        }).catch(error => {
          if (error instanceof mongoose.Error.ValidationError) {
            res.render('recipe/new', {
              recipe: recipe,
              error: error.errors
            });
          } else {
            next(error);
          }
        });
}
const mongoose = require('mongoose');
const Recipe = require('../models/recipe.model');
const Ingredient = require('../models/ingredient.model');
const User = require('../models/user.model');
const passport = require('passport');
var Dropbox = require('dropbox').Dropbox;
require('isomorphic-fetch');
var fs = require('fs');
var path = require('path');
var prompt = require('prompt');
const ACCESS_TOKEN = "2iy2FNkeNWYAAAAAAAAA6E2nrYYL--f3MkSAtvn72g-4sDHe1qW51QJRCOxPtu6y";
var dbx = new Dropbox({ accessToken: ACCESS_TOKEN });

module.exports.show = (req, res, next) => {
    Recipe.find()
        .populate('author')
        .sort({ createdAt: -1 })
        .then((recipes) => {
            if(recipes.length > 0){
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

module.exports.delete = (req, res, next) => {
    console.log("ASDF");
    Recipe.findByIdAndRemove(req.params.id)
    .then((recipe) => {
         res.redirect('/profile');
       }); 
}

module.exports.edit = (req, res, next) => {
    Recipe.findById(req.params.id)
    .then((recipe) => {
         res.render('recipes/edit', {
           recipe: recipe
         });
       }); 
}

module.exports.doEdit = (req, res, next) => {
    if(req.file){
        ingredients = req.body.ingredients.split(",");
        img = req.file ? req.file.filename : '';
        Recipe.findByIdAndUpdate(req.params.id,{$set: { name: req.body.name, description: req.body.description, imgs: img }}, { 'new': true} )
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
                                res.render('recipes/edit', { 
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
            res.render('recipe/edit', {
              recipe: recipe,
              error: error.errors
            });
          } else {
            next(error);
          }
        });
    } else {
        ingredients = req.body.ingredients.split(",");
        Recipe.findByIdAndUpdate(req.params.id,{$set: { name: req.body.name, description: req.body.description}}, { 'new': true} )
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
                                res.render('recipes/edit', { 
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
            res.render('recipe/edit', {
              recipe: recipe,
              error: error.errors
            });
          } else {
            next(error);
          }
        });
    }
    
}

module.exports.search = (req, res, next) => {
    const ingredients = req.body.ingredients.split(",");
    Recipe.find( { 'ingredients.ingredient':{ $all : ingredients} })
        .then(recipes => {
            if( recipes.length > 0 ){
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
    ingredients = req.body.ingredients.split(",");
    recipes = req.body.name;
    img = req.file ? req.file.filename : '';
    recipe = new Recipe({
       name: req.body.name,
       description: req.body.description,
       author: req.user._id
      });
    recipe.save()
        .then((savedRecipe) => {
            console.log(savedRecipe);
            uploadDB(img,savedRecipe._id);
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

function uploadDB(filePath,savedRecipe){
    path = "./public/uploads/" + filePath;
    fs.readFile(path, 'utf8', function (err, contents) {
        if (err) {
          console.log('Error: ', err);
        } 
    
        // This uploads basic.js to the root of your dropbox
        dbx.filesUpload({ path: '/' + filePath, contents: contents })
          .then(function (response) {
            parameters = {
                    "path": response.path_lower,
                    "settings": {
                        "requested_visibility": "public"
                }
            };
            dbx.sharingCreateSharedLinkWithSettings(parameters)
            .then(response => {
                Recipe.findByIdAndUpdate(savedRecipe, { imgs: response.url }, { new: true })
                                .then((recipe) => console.log(recipe));
               // return response.url;
            })
            .catch(function (err) {
                console.log(err);
              });
          })
          .catch(function (err) {
            console.log(err);
          });
      });
    
}


  
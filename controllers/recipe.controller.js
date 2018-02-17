const mongoose = require('mongoose');
const Recipe = require('../models/recipe.model');
const Ingredient = require('../models/ingredient.model');
const User = require('../models/user.model');
const passport = require('passport');

const axios = require('axios');

const dbx = require ('../config/dropbox.config');


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
         res.render('recipes/showOne', {
           recipe: recipe
         });
       }); 
}

module.exports.delete = (req, res, next) => {
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
    const ingredients = req.body.ingredients.split(",");
    const img = req.file ? req.file.filename : '';
    const updateObj = req.file
        ? { name: req.body.name, description: req.body.description, ingredients: [], imgs: img }
        : { name: req.body.name, description: req.body.description, ingredients: [] }
    Recipe.findByIdAndUpdate(req.params.id,{$set: updateObj}, { 'new': true } )
    .then((savedRecipe) => {
        ingredients.forEach(element => {
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
            })
            .catch(error => next(error));
        });
        if (img) { 
            dbx.uploadDB(img, savedRecipe);
            res.redirect('/profile');
        } else {
            res.redirect('/profile');
        }
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

module.exports.search = (req, res, next) => {
    console.log(req.body);
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
       author: req.user._id,
       directions: req.body.directions
      });
    recipe.save()
        .then((savedRecipe) => {
            console.log(savedRecipe);
            dbx.uploadDB(img,savedRecipe._id);
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
            setTimeout(res.redirect("/profile"),10);
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

module.exports.searchRecipe = function (req, res, next) {
res.render('recipes/searchapi');

}
    module.exports.findResults = function (req, res, next) {
       console.log(req.body.ingredients)
          axios.get("http://food2fork.com/api/search", {
            params: {
                key: "e1f52bc32f4918a287b8bf0e41d3d5bd",
                q: req.body.ingredients
            }
          })
          .then(function (response) {
            console.log("heey");
            res.render('recipes/resultsapi', {
                recipes: response.data.recipes
            });
          })
          .catch(function (error) {
            next(error);
          });
        }
  
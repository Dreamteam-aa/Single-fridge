const mongoose = require('mongoose');
const Recipe = require('../models/recipe.model');
const Ingredient = require('../models/ingredient.model');
const User = require('../models/user.model');
const passport = require('passport');

module.exports.show = (req, res, next) => {
    Recipe.find()
        .populate('ingredients.ingredient')
        .sort({ createdAt: -1 })
        .then((recipes) => {
            console.log(recipes);
            res.render('recipes/show', {
                recipes: recipes
            });
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

module.exports.create = (req, res, next) => {
    res.render('recipes/new'); 
}

module.exports.doCreate = (req, res, next) => {
    const ingredientsIds = [];
    ingredients = req.body.ingredients.split(",");
    recipes = req.body.name;
    
    
    recipe = new Recipe({
       name: req.body.name,
       description: req.body.description
   //    author: req.user._id
      });
    recipe.save()
        .then((savedRecipe) => {
            ingredients.forEach(element => {
                Ingredient.findOne({ name: element })
                .then(ing => {
                    if (ing != null) {
                        next();
                    } else {
                        ing = new Ingredient({
                            name: element
                        });
                        ing.save()
                        .then((savedIng) => {
                            ingredientsIds.push(savedIng);
                            console.log(savedIng);
                            console.log(ingredientsIds);
                            Recipe.findByIdAndUpdate(savedRecipe._id, { $push: { ingredients: { ingredient: savedIng._id }}})
                                .then(() => next());
                        })
                        .catch(error => {
                            if (error instanceof mongoose.Error.ValidationError) {
                                res.render('recipes/new', { 
                                    recipes: recipes,
                                    ingredients: ingredients,
                                    error: error.errors 
                                });
                            } else {
                                next(error);
                            }
                        });
                 }
                }).catch(error => next(error));
            });
          res.redirect('/');
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
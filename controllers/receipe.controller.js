const mongoose = require('mongoose');
const Recipe = require('../models/receipe.model');
const passport = require('passport');

module.exports.show = (req, res, next) => {
    Recipe.find()
        .sort({ createdAt: -1 })
        .then((recipes) => {
            res.render('recipes/index', {
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
    ingredients = req.body.ingredients.split(",");
    recipes = req.body.name;
    ingredients.forEach(element => {
        ingredient.findOne({ name: element })
        .then(ing => {
            if (ing != null) {
                next();
            } else {
                ing = new Ingredient({
                    name: element
                });
                ing.save()
                .then(() => {
                    next();
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
    
    recipe = new Recipe({
       name: req.body.name,
       description: req.body.description,
       author: req.user._id
      });
    recipe.save()
        .then(() => {
          res.redirect('recipe/index');
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
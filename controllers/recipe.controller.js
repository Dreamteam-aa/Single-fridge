const mongoose = require('mongoose');
const Recipe = require('../models/recipe.model');
const Ingredient = require('../models/ingredient.model');
const User = require('../models/user.model');
const passport = require('passport');
const _ = require('underscore');

module.exports.show = (req, res, next) => {
    Recipe.find()
        .populate('ingredients.ingredient')
        .sort({ createdAt: -1 })
        .then((recipes) => {
            console.log(recipes);
        User.findById(recipes[0].author)
        .then((user) => {
            res.render('recipes/show', {
                recipes: recipes,
                author: user
            });
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
    var arrayOfIds = [];
    var recipes = [];
    var auxArray = [];
    const ingredientsIds = [];
    Recipe.find()
        .then((recipes) => {
            recipes.forEach(recipe => {
                arrayOfIds.push(recipe._id);
            });
        })
        .catch(error => next(error));
    ingredients = req.body.ingredients.split(",");
    console.log(ingredients);
    ingredients.forEach(element => {
        Ingredient.findOne({ name: element })
        .then(ing => {
            if (ing != null) {
                ingredientsIds.push(ing._id);
                console.log(ingredientsIds);
                Recipe.find( { ingredients: { ingredient: ing._id }} )
                    .then(recipe => {
                         
                    if(recipe != []){
                    recipe.forEach(element => {
                        auxArray.push(element._id);
                    });
                    console.log("rec");
                    arrayOfIds = _.intersection(arrayOfIds, auxArray);
                    console.log(arrayOfIds);
                    } else {
                        next();
                    }
                  })
                .catch(error => next(error));
            } else {
                next();
         }
        }).catch(error => next(error));
    }).then(response => {
        arrayOfIds.forEach(id => {
            Recipe.findById(id)
            .then(recipe => {
                if (recipe != null) {
                    recipes.push(recipe);
                } else {
                    next();
             }
            }).catch(error => next(error));
        });
    })
    .catch(error => next(error));
    
    

    if(recipes.length<1){
        error = {
            text: "No recipes with these ingredients"
        };
    }

    res.render("recipes/search", {
        recipes: recipes,
        errors: error,
        search: req.body.ingredients
    });
    

}

module.exports.create = (req, res, next) => {
    res.render('recipes/new'); 
}

module.exports.doCreate = (req, res, next) => {
    const ingredientsIds = [];
    ingredients = req.body.ingredients.split(",");
    recipes = req.body.name;
    
    console.log(req.user);
    recipe = new Recipe({
       name: req.body.name,
       description: req.body.description,
       author: req.user._id
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
                       //     console.log(savedIng);
                       //     console.log(ingredientsIds);
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
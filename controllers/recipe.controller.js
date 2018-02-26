const mongoose = require('mongoose');
const Recipe = require('../models/recipe.model');
const Ingredient = require('../models/ingredient.model');
const User = require('../models/user.model');
const passport = require('passport');
var request = require('request');
var rp = require('request-promise');

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
        if( recipe.rating.length > 0 ){
            var sum = recipe.rating.reduce((x, y) => x + y);
            average = Math.round(sum/recipe.rating.length);
            
        } else {
            average = 0;
        }
         console.log(average);
         User.findById(req.user._id)
         .then(user => {
            res.render('recipes/showOne', {
                recipe: recipe,
                rating: average,
                favorites: user.favorites
              });
         })
         .catch(error => next(error));
         
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

module.exports.search2 = (req, res, next) => {
    var finalRecipes = [];
    var ingredientsArray = req.body.ingredients.replace(/^\s*|\s*$/g,'').split(",");
    const ingredients = ingredientsArray.map(string => string.trim().toLowerCase())
    Recipe.find()
        .populate('author')
        .then(recipes => {
            if( recipes.length > 0 ){
                recipes.forEach(recipe => {
                    valuesFound = true;
                    count=0;
                    ingredients.forEach(ing => {
                        recipe.ingredients.forEach(recipeing =>{
                            ingr = recipeing.ingredient;
                            if ( ingr.indexOf(ing)>-1 ){
                                count++;
                             //   recipe.ingredients.length = 0;
                            }
                        });
                        if(count<ingredients.length){
                            valuesFound = false;
                        }else{
                            valuesFound = true;
                        }
                    });
                    
                    if ( valuesFound == true ){
                //        console.log(recipe);
                        finalRecipes.push(recipe);
                    }
                });
            if( finalRecipes.length > 0 ){
                res.render('recipes/search', {
                    recipes: finalRecipes,
                    ingredients: ingredientsArray
                    });
            } else {
                res.render('recipes/search', {
                    recipes: finalRecipes,
                    ingredients: ingredientsArray,
                    errors: {
                        text: "We could not find any recipes including these ingredients."
                    } 
                    });
            }
                
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
    const recipe = new Recipe({
       name: req.body.name,
       description: req.body.description,
       author: req.user._id,
       directions: req.body.directions
      });
    if( req.body.ingredients.length == 0){
        var errorIng = {
            ingredients: 'Ingredients are required'
        }
        if ( req.body.name.length == 0){
            errorIng.name = "Name is required";
        }
        if ( req.body.description.length == 0){
            errorIng.description = "Description is required";
        }
        if (req.body.directions.length == 0){
            errorIng.directions = "Directions are required";
        }
        console.log(errorIng);
        res.render('recipes/new', {
            recipe: recipe,
            error: errorIng
          });
    } else {
    recipe.save()
        .then((savedRecipe) => {
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
                                    recipe: recipe,
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
            req.flash('Recipe', recipe);
                res.render('recipes/new', { 
                    recipe: recipe,
                    error: error.errors 
                });
          } else {
            next(error);
          }
        });
    }
}

module.exports.searchRecipe = function (req, res, next) {
res.render('recipes/searchapi');

}


module.exports.findResults = function (req, res, next) {
       //console.log(req.body.ingredients)
          axios.get("https://test-es.edamam.com/search?",{
            params: {
                q: req.body.ingredients,
                app_id: "3fa5082a",
                app_key: "3293e695ea7945afe407438a27f2f775"
            }
            })
          .then(function (response) {
            response.data.hits.forEach(element => {
                recipe = new Recipe({
                    name: element.recipe.label,
                    description: element.recipe.label,
                    directions: element.recipe.ingredientLines,
                    imgs: element.recipe.image,
                    author: req.user._id,
                    url: element.recipe.uri
                   });
                Recipe.findOne({ url: element.recipe.uri })
                 .then(result => {
                    if( result == null ){
                        if( element.recipe.image.length > 0 ){
                            recipe = new Recipe({
                                name: element.recipe.label,
                                description: element.recipe.label,
                                directions: element.recipe.ingredientLines,
                                imgs: element.recipe.image,
                                author: req.user._id,
                                url: element.recipe.uri
                                });
                            recipe.save()
                             .then((savedRecipe) => {
                              //   dbx.uploadDB(img,savedRecipe._id);
                                 element.recipe.ingredients.forEach(elements => {
                                     cleanIng = RemoveAccents(elements.text.toString());
                                     if ( cleanIng.length > 35 ){
                                         cleanIng = cleanIng.substr(0,35);
                                     }
                                     ing = new Ingredient({
                                         name: cleanIng
                                     });
                                   Ingredient.findOne({ name: cleanIng })
                                     .then(ing => {
                                         if (ing != null) {
                                             name = ing.name.toString().toLowerCase();
                                             Recipe.findByIdAndUpdate(savedRecipe._id, { $push: { ingredients: { ingredient: name }}})
                                                     .then(() =>  next())
                                                     .catch(error => next());
                                             //next();
                                         } else {
                                             name = RemoveAccents(elements.text.toString()).toLowerCase();
                                             if( name.length > 35 ){
                                                 name = name.substr(0,35);
                                             }
                                             ing = new Ingredient({
                                                 name: name
                                             });
                                             ing.save()
                                             .then((savedIng) => {
                                                 Recipe.findByIdAndUpdate(savedRecipe._id, { $push: { ingredients: { ingredient: savedIng.name }}})
                                                     .then(() =>  next());
                                             }).catch(error => next());
                                      }
                                     })
                                 });
                                 setTimeout(res.redirect("/profile"),10);
                             }).catch(error => next(error));
                        }
                    
                    }
                }).catch(error => next(error));
                 
            });  
        }).catch(error => {
            if (error instanceof mongoose.Error.ValidationError) {
              res.render('recipes/new', {
                recipe: recipe,
                error: error.errors
              });
            } else {
              next(error);
            }
          });    
} 

module.exports.findResults2 = function (req, res, next) {
    //console.log(req.body.ingredients)
       axios.get("https://test-es.edamam.com/search?",{
         params: {
             q: req.body.ingredients,
             app_id: "3fa5082a",
             app_key: "3293e695ea7945afe407438a27f2f775"
         }
         })
       .then(function (response) {
         response.data.hits.forEach(element => {
             recipe = new Recipe({
                 name: element.recipe.label,
                 description: element.recipe.label,
                 directions: element.recipe.ingredientLines,
                 imgs: element.recipe.image,
                 author: req.user._id,
                 url: element.recipe.uri
                });
             Recipe.findOne({ url: element.recipe.uri })
              .then(result => {
                 if( result == null ){
                     if( element.recipe.image.length > 0 ){
                         recipe = new Recipe({
                             name: element.recipe.label,
                             description: element.recipe.label,
                             directions: element.recipe.ingredientLines,
                             imgs: element.recipe.image,
                             author: req.user._id,
                             url: element.recipe.uri
                             });
                         recipe.save()
                          .then((savedRecipe) => {
                           //   dbx.uploadDB(img,savedRecipe._id);
                              element.recipe.ingredients.forEach(elements => {
                                  cleanIng = RemoveAccents(elements.text.toString());
                                  if ( cleanIng.length > 35 ){
                                      cleanIng = cleanIng.substr(0,35);
                                  }
                                  ing = new Ingredient({
                                      name: cleanIng
                                  });
                                Ingredient.findOne({ name: cleanIng })
                                  .then(ing => {
                                      if (ing != null) {
                                          name = ing.name.toString().toLowerCase();
                                          Recipe.findByIdAndUpdate(savedRecipe._id, { $push: { ingredients: { ingredient: name }}})
                                                  .then(() =>  next())
                                                  .catch(error => next());
                                          //next();
                                      } else {
                                          name = RemoveAccents(elements.text.toString()).toLowerCase();
                                          if( name.length > 35 ){
                                              name = name.substr(0,35);
                                          }
                                          ing = new Ingredient({
                                              name: name
                                          });
                                          ing.save()
                                          .then((savedIng) => {
                                              Recipe.findByIdAndUpdate(savedRecipe._id, { $push: { ingredients: { ingredient: savedIng.name }}})
                                                  .then(() =>  next());
                                          }).catch(error => next());
                                   }
                                  })
                              });
                              setTimeout(res.redirect("/profile"),10);
                          }).catch(error => next(error));
                     }
                 
                 }
             }).catch(error => next(error));
              
         });  
     }).catch(error => {
         if (error instanceof mongoose.Error.ValidationError) {
           res.render('recipes/new', {
             recipe: recipe,
             error: error.errors
           });
         } else {
           next(error);
         }
       });    
} 

module.exports.rate = (req,res,next) => {
    Recipe.findByIdAndUpdate(req.body.id, { $push: {
        rating: Number(req.body.ratingVal)
    }
    })
    .then(recipe => {
        res.redirect("/recipes/recipe/"+req.body.id);
    })
    .catch(error => next());

} 



function RemoveAccents(strAccents) {
    var strAccents = strAccents.split('');
    var strAccentsOut = new Array();
    var strAccentsLen = strAccents.length;
    var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüŠšŸÿýŽž';
    var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuSsYyyZz";
    for (var y = 0; y < strAccentsLen; y++) {
        if (accents.indexOf(strAccents[y]) != -1) {
            strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
        } else
            strAccentsOut[y] = strAccents[y];
    }
    strAccentsOut = strAccentsOut.join('');
    return strAccentsOut;
}
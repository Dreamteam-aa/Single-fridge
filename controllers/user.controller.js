const User = require('../models/user.model');
const Recipes = require('../models/recipe.model');

module.exports.profile = (req, res, next) => {
    Recipes.find({author: req.user._id})
        //.populate('ingredients.ingredient')
        .sort({ createdAt: -1 })
        .then((recipes) => {
            if( recipes.length > 0 ){
        //    console.log(recipes[0].ingredients[0].name);
            res.render('user/profile', {
                recipes: recipes
            });
            } else {
            res.render('user/profile',{
                recipes: recipes
            });
             }
        })
        .catch(error => next(error));
    
}

module.exports.list = (req, res, next) => {
    User.find({})
        .then(users => {
            res.render('user/list', {
                users: users
            });
        })
        .catch(error => next(error));
}
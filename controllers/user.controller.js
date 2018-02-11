const User = require('../models/user.model');
const Recipes = require('../models/recipe.model');

module.exports.profile = (req, res, next) => {
    Recipes.find({author: req.user._id})
        .sort({ createdAt: -1 })
        .then((recipes) => {
            if( recipes.length > 0 ){
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
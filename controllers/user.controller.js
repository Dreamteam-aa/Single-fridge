const User = require('../models/user.model');
const Recipes = require('../models/recipe.model');

module.exports.profile = (req, res, next) => {
    Recipes.find({author: req.user._id})
        .populate('ingredients.ingredient')
        .sort({ createdAt: -1 })
        .then((recipes) => {
            console.log(recipes);
            res.render('user/profile', {
                recipes: recipes
            });
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
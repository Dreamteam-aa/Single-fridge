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

module.exports.editProfile= (req, res, next) => {
 console.log("hola");
  User.findById(req.params.id)
  .then((user) => {
       res.render('user/edit', {
        user: user
       });
     }); 
    }




module.exports.doEdit= (req, res, next) => {
    //console.log(session.user._id)
    const userId = req.user._id;
    const updates = {
        username: req.body.username,
        description: req.body.description
    };
  
    User.findByIdAndUpdate(userId, updates).then((user) => {
      res.redirect('/profile');
    });
  };
const User = require('../models/user.model');
const Recipe = require('../models/recipe.model');
var Dropbox = require('dropbox').Dropbox;
require('isomorphic-fetch');
var fs = require('fs');
var path = require('path');
var prompt = require('prompt');

const dbx = require ('../config/dropbox.config');

module.exports.showProfile = (req, res, next) => {
    Recipe.find({author: res.locals.session._id})
        .sort({ createdAt: -1 })
        .then((recipes) => {
            if( recipes.length > 0 ){
            res.render('user/profile', {
                recipes: recipes,
                user: res.locals.session
            });
            } else {
            res.render('user/profile',{
                recipes: recipes,
                user: res.locals.session
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
  User.findById(req.params.id)
  .then((user) => {
       res.render('user/edit', {
        user: user
       });
     }); 
    }



module.exports.doEdit = (req, res, next) => {
    const userId = req.user._id;
    img = req.file ? req.file.filename : '';
    const updates = {
        username: req.body.username,
        description: req.body.description
    };
    User.findByIdAndUpdate(userId, updates).then((user) => {
        dbx.uploadDB(img,user);
      res.redirect('/profile');
    });
};

module.exports.delete = (req, res, next) => {
    const userId = req.params.id;
    User.findByIdAndRemove(userId)
    .then((user) => {
        if (user != "null"){
    
         res.redirect('/user/list');
        } 
       }); 
}

module.exports.makeAdmin = (req, res, next) => {
    const userId = req.params.id;
    User.findByIdAndUpdate(userId, {role : "ADMIN"}).then((user) => {
        res.redirect('/user/list');
                
    });
}

module.exports.addFav = (req,res,next) => {
    const userId = req.user._id;
    User.findByIdAndUpdate(userId, { $push: {
        favorites: req.body.id
    }
    })
    .then(user => {
        console.log(user);
        res.redirect("/recipes/recipe/"+req.body.id);
    })
    .catch(error => next(error));

}

module.exports.showFavs = (req,res,next) => {
    const userId = req.user._id;
    recipe = new Recipe({
        id: req.body.id
        });
    User.findById(userId)
    .then(user => {
        console.log(user.recipes);
        Recipe.find( { '_id':{ $in : user.favorites} })
        .then(recipes => {
            if( recipes.length > 0 ){
                console.log("ASDF");
                res.render('recipes/favs', {
                recipes: recipes
                });
            } else {
                res.render('recipes/favs', {
                    recipes: recipes 
                    });
            }
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));

}
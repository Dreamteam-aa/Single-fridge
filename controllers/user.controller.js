const User = require('../models/user.model');
const Recipes = require('../models/recipe.model');
var Dropbox = require('dropbox').Dropbox;
require('isomorphic-fetch');
var fs = require('fs');
var path = require('path');
var prompt = require('prompt');
const ACCESS_TOKEN = "2iy2FNkeNWYAAAAAAAAA6E2nrYYL--f3MkSAtvn72g-4sDHe1qW51QJRCOxPtu6y";
var dbx = new Dropbox({ accessToken: ACCESS_TOKEN });


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
        uploadDB(img,user);
      res.redirect('/profile');
    });
};

function uploadDB(filePath,updatedProfile){
    path = "./public/uploads/" + filePath;
    fs.readFile(path, function (err, contents) {
        if (err) {
          console.log('Error: ', err);
        } 
        // This uploads basic.js to the root of your dropbox
        dbx.filesUpload({ path: '/' + filePath, contents: contents })
          .then(function (response) {
            parameters = {
                    "path": response.path_lower,
                    "settings": {
                        "requested_visibility": "public"
                }
            };
            dbx.sharingCreateSharedLinkWithSettings(parameters)
            .then(response => {
                urlAux = response.url.split("/s");
                url = urlAux[1].split("?");
                console.log(url);
                User.findByIdAndUpdate(updatedProfile, { profileImg: url[0] }, { new: true })
                                .then((user) => console.log(user));
               // return response.url;
            })
            .catch(function (err) {
                console.log(err);
              });
          })
          .catch(function (err) {
            console.log(err);
          });
      });
    }
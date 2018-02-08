const mongoose = require('mongoose');
const User = require('../models/user.model');
const passport = require('passport');
const session = require('express-session');

module.exports.signup = (req, res, next) => {
    if (typeof(session) !== 'undefined') {
        res.redirect('/')}
        else {
            res.render('auth/signup');
            }
}

module.exports.login = (req, res, next) => {
            res.render('auth/login',{
                flash: req.flash()
            });
            }


module.exports.doLogin = (req, res, next) => {
        passport.authenticate('local-auth', (error, user, validation) => {
            if (error) {
                next(error);
            } else if (!user) {
                res.render('auth/login', { error: validation });
            } else {
                req.login(user, (error) => {
                    if (error) {
                        next(error);
                    } else {
                        res.redirect('/profile');
                    }
                });
            }
        })(req, res, next);
    }

module.exports.loginWithProviderCallback = (req, res, next) => {
    passport.authenticate(`${req.params.provider}-auth`, (error, user) => {
        if(error) {
            next(error);
        } else {
            req.login(user, (error) => {
                if (error) {
                    next(error);
                } else {
                    res.redirect('/profile');
                }
            });
        }
    })(req, res, next);
}

module.exports.logout = (req, res, next) => {
    req.logout();
    res.redirect('/');
}
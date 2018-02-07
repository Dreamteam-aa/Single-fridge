const User = require('../models/user.model');
const FBStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;



const FB_CLIENT_ID = process.env.FB_CLIENT_ID || '1586947611388577';
const FB_CLIENT_SECRET = process.env.FB_CLIENT_SECRET || 'f6b3949099f8d1ee2872b23e06101692';

const FB_CB_URL = '/auth/fb/cb';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1002294112479-3fo3ckannlhq7qlpbbfjgv4tkopilunl.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '1NfMRGjsmDrLUKgahVZLdiT2';
const GOOGLE_CB_URL = '/auth/google/cb';

const FB_PROVIDER = 'facebook';
const GOOGLE_PROVIDER = 'google';

module.exports.setup = (passport) => {
  passport.serializeUser((user, next) => {
    next(null, user._id);
});

passport.deserializeUser((id, next) => {
    User.findById(id)
        .then(user => {
            next(null, user);
        })
        .catch(error => next(error));
});

    passport.use('fb-auth', new FBStrategy({
        clientID: FB_CLIENT_ID,
        clientSecret: FB_CLIENT_SECRET,
        callbackURL: FB_CB_URL,
        profileFields: ['id', 'emails']
    }, authenticateOAuthUser));

    passport.use('google-auth', new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CB_URL
    }, authenticateOAuthUser));

    function authenticateOAuthUser(accessToken, refreshToken, profile, next) {
        let provider;
        if (profile.provider === FB_PROVIDER) {
            provider = 'facebookId'
        } else if (profile.provider === GOOGLE_PROVIDER) {
            provider = 'googleId';
        } else {
            next();
        }
        User.findOne({ [`social.${provider}`]: profile.id })
            .then(user => {
                if (user) {
                    next(null, user);
                } else {
                    const email = profile.emails ? profile.emails[0].value : null;
                    user = new User({
                        username: email || DEFAULT_USERNAME,
                        password: Math.random().toString(36).slice(-8), // FIXME: insecure, use secure random seed
                        social: {
                            [provider]: profile.id
                        }
                    });
                    console.log
                    user.save()
                        .then(() => {
                            next(null, user);
                        })
                        .catch(error => next(error));
                }
            })
            .catch(error => next(error));
    }
 }

 module.exports.isAuthenticated = (req, res, next) => {
     if (req.isAuthenticated()) {
         next()
     } else {
         res.status(401);
         res.redirect('/login');
     }
 }

 module.exports.checkRole = (role) => {
     return (req, res, next) => {
         if (!req.isAuthenticated()) {
             res.status(401);
             res.redirect('/login');
         } else if (req.user.role === role) {
             next();
         } else {
             res.status(403);
             res.render('error', {
                 message: 'Forbidden',
                 error: {}
             });
         }
     }
 }

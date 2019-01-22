const passport = require('passport'),
    mongoose = require('mongoose'),
    errorFactory = require('../factories/errorFactory');

// Strategies
const LocalStrategy = require('passport-local').Strategy;

// User Model
const User = mongoose.model('User');

// Login
passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    User.findOne({ email })
        .then(user => {
            if(!user) { return done(errorFactory.validationError.getError(['email'])); }
            else if(!user.validPassword(password)) { return done(errorFactory.validationError.getError(['password'])); }
            user.token = user.generateJWT();
            return done(null, user);
        })
        .catch(done);
}));

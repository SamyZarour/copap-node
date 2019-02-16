const passport = require('passport'),
    mongoose = require('mongoose'),
    errorFactory = require('../factories/errorFactory');

// Strategies
const LocalStrategy = require('passport-local').Strategy;

// User Model
const User = mongoose.model('User');

// Login
passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, (username, password, done) => {
    User.findOne({ username })
        .then(user => {
            if(!user) { return done(errorFactory.validationError.getError(['username'])); }
            else if(!user.validPassword(password)) { return done(errorFactory.validationError.getError(['password'])); }
            user.token = user.generateJWT();
            return done(null, user);
        })
        .catch(done);
}));

const router = require('express').Router(),
    passport = require('passport'),
    User = require('../../models/User'),
    auth = require('../../utils/jwt'),
    errorFactory = require('../../factories/errorFactory');


// Preload user object on routes with ':user'
router.param('user', (req, res, next, username) => {
    User.findOne({ username })
        .then(user => {
            if(!user) { throw errorFactory.notFoundError.getError(['user']); }
            req.user = user;
            return next();
        })
        .catch(next);
});

router.get('/current-user', auth.required, (req, res, next) => {
    User.findById(req.payload.id)
        .then(user => {
            if(!user) { throw errorFactory.notFoundError(['user']); }
            return res.json({
                message: 'User Profile',
                user: user.toProfileJSON()
            });
        })
        .catch(next);
});

// Create user
router.post('/', auth.required, (req, res, next) => {
    User.findById(req.payload.id)
        .then(user => {
            if(!user) { throw errorFactory.authenticationError.getError(); }
            if(user.role !== 'admin') { throw errorFactory.authorizationError.getError(); }

            let { username, email, password } = req.body;

            if(!password) { throw errorFactory.requiredFieldError.getError(['password']); }
            if(!password.match(/^[A-Za-z0-9!@#$%^&*\d]{8,32}$/)) { throw errorFactory.validationError.getError(['password']); }

            const newUser = new User();
            newUser.username = username;
            newUser.email = email;
            newUser.setPassword(password);

            return newUser.save();
        })
        .then(user => res.json({
            message: 'User Created',
            user: user.toAuthJSON()
        }))
        .catch(next);
});

// Get user by username
router.get('/:user', auth.optional, (req, res, next) => {
    Promise.all([req.payload ? User.findById(req.payload.id) : null])
        .then(results => {
            const owner = (results[0] && (results[0]._id.equals(req.user._id) || results[0].role === 'admin'));
            const user = owner ? req.user.toJSON() : req.user.toProfileJSON();
            const message = owner ? 'User Full Profile' : 'User Profile';
            res.json({
                message,
                user
            });
        })
        .catch(next);
});

// Edit user
router.put('/:user', auth.required, (req, res, next) => {
    User.findById(req.payload.id)
        .then(user => {
            if(!user) { throw errorFactory.authenticationError.getError(); }
            if(user.role !== 'admin' && !user._id.equals(req.user._id)) { throw errorFactory.authorizationError.getError(); }
            let { username, email } = req.body;
            return req.user.edit(username, email);
        })
        .then(user => {
            return res.json({
                message: 'User Updated',
                user: user.toJSON()
            });
        })
        .catch(next);
});

// Delete user
router.delete('/:user', auth.required, (req, res, next) => {
    User.findById(req.payload.id)
        .then(user => {
            if(!user) { throw errorFactory.authenticationError.getError(); }
            else if(user.role !== 'admin' && !user._id.equals(req.user._id)) { throw errorFactory.authorizationError.getError(); }
            return User.findByIdAndRemove(req.user.id);
        })
        .then(() => res.sendStatus(204))
        .catch(next);
});

// Login user
router.post('/login', (req, res, next) => {
    if(!req.body.email) { throw errorFactory.requiredFieldError.getError(['email']); }
    if(!req.body.password) { throw errorFactory.requiredFieldError.getError(['password']); }

    passport.authenticate('local-login', { session: false }, (err, user) => {
        if(err) { return next(err); }
        if(!user) { throw errorFactory.authenticationError.getError(); }
        return res.json({ message: 'User Login', user: user.toAuthJSON() });
    })(req, res, next);
});

module.exports = router;

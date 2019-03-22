const router = require('express').Router(),
    passport = require('passport'),
    User = require('../../models/User'),
    auth = require('../../utils/jwt'),
    errorFactory = require('../../factories/errorFactory'),
    { getUser } = require('../../utils/sql');


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
                user: user.toJSON()
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
router.get('/:user', (req, res) => {
    const user = req.user.toJSON();
    const message = 'User Profile';
    res.json({
        message,
        user
    });
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
    const { username, password } = req.body;
    if(!username) { throw errorFactory.requiredFieldError.getError(['username']); }
    if(!password) { throw errorFactory.requiredFieldError.getError(['password']); }

    passport.authenticate('local-login', { session: false }, (err, user) => {
        if(err) {
            getUser(username, password)
                .then(result => {
                    const user = result && result.recordset && result.recordset.length === 1 && result.recordset[0];
                    if(user) { return Promise.all([user, User.findOne({ username })]); }
                    throw err;
                })
                .then(([userInfo, oldUser]) => {
                    const { username, email, password } = userInfo;

                    if(oldUser) {
                        oldUser.setPassword(password);
                        oldUser.email = `${oldUser.username}@copap.com`;
                        return oldUser.save();
                    }

                    const newUser = new User();
                    newUser.username = username.trim();
                    newUser.email = email.trim();
                    newUser.setPassword(password.trim());
                    return newUser.save();
                })
                .then(user => res.json({
                    message: 'User Login',
                    user: user.toAuthJSON()
                }))
                .catch(next);
        }
        else {
            if(!user) { throw errorFactory.authenticationError.getError(); }
            return res.json({ message: 'User Login', user: user.toAuthJSON() });
        }
    })(req, res, next);
});

module.exports = router;

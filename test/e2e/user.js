// Require the dev-dependencies
const mongoose = require('mongoose'),
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    { User } = require('../../models'),
    server = require('../../bin/www');

// Setting up chai
chai.should();
chai.use(chaiHttp);

// Disabling Mongoose logs
mongoose.set('debug', false);

// Parent Block
describe('User', () => {
    const user1 = {
            username: 'user1',
            email: 'user1@mail.com',
            password: 'password'
        },
        user2 = {
            username: 'user2',
            email: 'user2@mail.com',
            password: 'password'
        },
        randomUser1 = {
            username: 'random1',
            email: 'random1@mail.com',
            password: 'password',
            bio: 'Random User Bio 1'
        },
        randomUser2 = {
            username: 'random2',
            email: 'random2@mail.com',
            password: 'password',
            bio: 'Random User Bio 2'
        },
        newUser = {
            username: 'new-user1',
            email: 'newuser1@mail.com',
            password: 'password'
        },
        editUser1 = {
            username: 'edit-user1',
            email: 'edituser1@mail.com',
            password: 'password'
        },
        editUser2 = {
            username: 'edit-user2',
            email: 'edituser2@mail.com',
            password: 'password'
        },
        admin = {
            username: 'admin',
            email: 'admin@gmail.com',
            password: 'password',
            role: 'admin'
        };

    // Reset Users
    before(done => {
        User.remove({})
            .then(() => chai.request(server).post('/api/users').send(user1))
            .then(res => {
                user1.token = res.body.user.token;
                return chai.request(server).post('/api/users').send(user2);
            })
            .then(res => {
                user2.token = res.body.user.token;
                return chai.request(server).post('/api/users').send(editUser1);
            })
            .then(res => {
                editUser1.token = res.body.user.token;
                return chai.request(server).post('/api/users').send(editUser2);
            })
            .then(res => {
                editUser2.token = res.body.user.token;
                return chai.request(server).post('/api/users').send(admin);
            })
            .then(res => {
                admin.token = res.body.user.token;
                return User.findOneAndUpdate({ username: admin.username }, { role: admin.role });
            })
            .then(() => done())
            .catch(done);
    });

    /*
    * Test the /POST route
    */
    describe('When we POST a User', () => {
        it('it should not POST a user with wrong format', done => {
            chai.request(server)
                .post('/api/users')
                .send({ ...newUser, username: 'some user' })
                .then(res => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('username');
                    res.body.errors.username.should.have.property('message').eql('not valid');
                    res.body.message.should.be.eql('User validation failed: username: not valid');
                    done();
                })
                .catch(done);
        });

        it('it should not POST a user without username field', done => {
            chai.request(server)
                .post('/api/users')
                .send({ ...newUser, username: undefined })
                .then(res => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('username');
                    res.body.errors.username.should.have.property('message').eql('can not be blank');
                    done();
                })
                .catch(done);
        });

        it('it should not POST a user that already exists', done => {
            chai.request(server)
                .post('/api/users')
                .send(user1)
                .then(res => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('email');
                    res.body.errors.email.should.have.property('message').eql('is already taken');
                    res.body.errors.should.have.property('username');
                    res.body.errors.username.should.have.property('message').eql('is already taken');
                    res.body.message.should.include('username: is already taken').and.include('email: is already taken');
                    done();
                })
                .catch(done);
        });

        it('it should POST a user', done => {
            chai.request(server)
                .post('/api/users')
                .send(newUser)
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User Created');
                    res.body.should.have.property('user');
                    res.body.user.should.have.property('username').eql(newUser.username);
                    res.body.user.should.have.property('email').eql(newUser.email);
                    res.body.user.should.have.property('token');
                    done();
                })
                .catch(done);
        });
    });

    /*
    * Test the /GET/:id route
    */
    describe('When we GET a profile by Id', () => {
        it('it should not GET a profile that does not exist', done => {
            chai.request(server)
                .get(`/api/users/${randomUser1.username}`)
                .then(res => {
                    res.should.have.status(404);
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('user');
                    res.body.errors.user.should.have.property('message').eql('not found');
                    res.body.message.should.be.eql('user : not found');
                    done();
                })
                .catch(done);
        });

        it('it should GET a profile by the given id without authentification', done => {
            chai.request(server)
                .get(`/api/users/${user1.username}`)
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User Profile');
                    res.body.user.should.have.property('username').eql(user1.username);
                    done();
                })
                .catch(done);
        });

        it('it should GET a profile by the given id with authentification but wrong user', done => {
            chai.request(server)
                .get(`/api/users/${user1.username}`)
                .set('authorization', `Bearer ${user2.token}`)
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User Profile');
                    res.body.user.should.have.property('username').eql(user1.username);
                    done();
                })
                .catch(done);
        });

        it('it should GET user\'s full profile', done => {
            chai.request(server)
                .get(`/api/users/${user1.username}`)
                .set('authorization', `Bearer ${user1.token}`)
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User Full Profile');
                    res.body.user.should.have.property('username').eql(user1.username);
                    done();
                })
                .catch(done);
        });
    });

    /*
    * Test the /PUT/:id route
    */
    describe('When we PUT a User', () => {
        it('it should not PUT a User that does not exist', done => {
            chai.request(server)
                .put(`/api/users/${randomUser1.username}`)
                .send({ bio: randomUser1.bio })
                .then(res => {
                    res.should.have.status(404);
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('user');
                    res.body.errors.user.should.have.property('message').eql('not found');
                    res.body.message.should.be.eql('user : not found');
                    done();
                })
                .catch(done);
        });

        it('it should not PUT a User when the user is not authenticated', done => {
            chai.request(server)
                .put(`/api/users/${editUser1.username}`)
                .send({ bio: randomUser1.bio })
                .then(res => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('authorization');
                    res.body.errors.authorization.should.have.property('message').eql('No authorization token was found');
                    done();
                })
                .catch(done);
        });

        it('it should not UPDATE a user when signed in as another user', done => {
            chai.request(server)
                .put(`/api/users/${editUser1.username}`)
                .send({ bio: randomUser1.bio })
                .set('authorization', `Bearer ${editUser2.token}`)
                .then(res => {
                    res.should.have.status(403);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('authorization');
                    res.body.errors.authorization.should.have.property('message').eql('not authorized');
                    res.body.message.should.be.eql('authorization : not authorized');
                    done();
                })
                .catch(done);
        });

        it('it should not UPDATE a user with wrong format', done => {
            chai.request(server)
                .put(`/api/users/${editUser1.username}`)
                .send({ username: 'other@user' })
                .set('authorization', `Bearer ${editUser1.token}`)
                .then(res => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('username');
                    res.body.errors.username.should.have.property('message').eql('not valid');
                    res.body.message.should.be.eql('User validation failed: username: not valid');
                    done();
                })
                .catch(done);
        });

        it('it should UPDATE a user given the id as admin', done => {
            chai.request(server)
                .put(`/api/users/${editUser1.username}`)
                .send({ bio: randomUser1.bio })
                .set('authorization', `Bearer ${admin.token}`)
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User Updated');
                    res.body.user.should.have.property('username').eql(editUser1.username);
                    res.body.user.should.have.property('bio').eql(randomUser1.bio);
                    done();
                })
                .catch(done);
        });

        it('it should UPDATE a user given the id as owner', done => {
            chai.request(server)
                .put(`/api/users/${editUser2.username}`)
                .send({ bio: randomUser2.bio })
                .set('authorization', `Bearer ${editUser2.token}`)
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User Updated');
                    res.body.user.should.have.property('username').eql(editUser2.username);
                    res.body.user.should.have.property('bio').eql(randomUser2.bio);
                    done();
                })
                .catch(done);
        });
    });

    /*
     * Test the /LOGIN route
     */
    describe('When we LOGIN a User', () => {
        it('it should not LOGIN a user if username is missing', done => {
            chai.request(server)
                .post('/api/users/login')
                .send({ password: user1.password })
                .then(res => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('email');
                    res.body.errors.email.should.have.property('message').eql('can not be blank');
                    res.body.message.should.be.eql('email : can not be blank');
                    done();
                })
                .catch(done);
        });

        it('it should not LOGIN a user if password is missing', done => {
            chai.request(server)
                .post('/api/users/login')
                .send({ email: user1.email })
                .then(res => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('password');
                    res.body.errors.password.should.have.property('message').eql('can not be blank');
                    res.body.message.should.be.eql('password : can not be blank');
                    done();
                })
                .catch(done);
        });

        it('it should not LOGIN a user if email is incorrect', done => {
            chai.request(server)
                .post('/api/users/login')
                .send({ email: `${user1.email}a`, password: user1.password })
                .then(res => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('email');
                    res.body.errors.email.should.have.property('message').eql('not valid');
                    res.body.message.should.be.eql('email : not valid');
                    done();
                })
                .catch(done);
        });

        it('it should not LOGIN a user if password is incorrect', done => {
            chai.request(server)
                .post('/api/users/login')
                .send({ email: user1.email, password: `${user1.password}a` })
                .then(res => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('password');
                    res.body.errors.password.should.have.property('message').eql('not valid');
                    res.body.message.should.be.eql('password : not valid');
                    done();
                })
                .catch(done);
        });

        it('it should LOGIN a user', done => {
            chai.request(server)
                .post('/api/users/login')
                .send(user1)
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User Login');
                    res.body.user.should.have.property('username').eql(user1.username);
                    res.body.user.should.have.property('email').eql(user1.email);
                    res.body.user.should.have.property('token');
                    done();
                })
                .catch(done);
        });
    });

    /*
    * Test the /GET/current-user route
    */
    describe('When we GET the current user', () => {
        it('it should not GET a profile if no token was passed on', done => {
            chai.request(server)
                .get('/api/users/current-user')
                .then(res => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('authorization');
                    res.body.errors.authorization.should.have.property('message').eql('No authorization token was found');
                    done();
                })
                .catch(done);
        });

        it('it should GET current user', done => {
            chai.request(server)
                .get('/api/users/current-user')
                .set('authorization', `Bearer ${user1.token}`)
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('User Profile');
                    res.body.user.should.have.property('username').eql(user1.username);
                    done();
                })
                .catch(done);
        });
    });

    /*
     * Test the /DELETE/:id route
     */
    describe('When we DELETE a User', () => {
        it('it should not DELETE user that does not exist', done => {
            chai.request(server)
                .delete(`/api/users/${randomUser1.username}`)
                .set('authorization', `Bearer ${user1.token}`)
                .then(res => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('user');
                    res.body.errors.user.should.have.property('message').eql('not found');
                    res.body.message.should.be.eql('user : not found');
                    done();
                })
                .catch(done);
        });

        it('it should not DELETE a user if user is not authenticated', done => {
            chai.request(server)
                .delete(`/api/users/${user1.username}`)
                .then(res => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('authorization');
                    res.body.errors.authorization.should.have.property('message').eql('No authorization token was found');
                    done();
                })
                .catch(done);
        });

        it('it should not DELETE a quiz that does not belong to the user', done => {
            chai.request(server)
                .delete(`/api/users/${user1.username}`)
                .set('authorization', `Bearer ${user2.token}`)
                .then(res => {
                    res.should.have.status(403);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('authorization');
                    res.body.errors.authorization.should.have.property('message').eql('not authorized');
                    res.body.message.should.be.eql('authorization : not authorized');

                    done();
                })
                .catch(done);
        });

        it('it should DELETE a user given the username as the user', done => {
            chai.request(server)
                .delete(`/api/users/${user1.username}`)
                .set('authorization', `Bearer ${user1.token}`)
                .then(res => {
                    res.should.have.status(204);
                    return User.find({ username: user1.username });
                })
                .then(users => {
                    users.length.should.be.eql(0);
                    done();
                })
                .catch(done);
        });

        it('it should DELETE a user given the username as the admin', done => {
            chai.request(server)
                .delete(`/api/users/${user2.username}`)
                .set('authorization', `Bearer ${admin.token}`)
                .then(res => {
                    res.should.have.status(204);
                    return User.find({ username: user2.username });
                }).then( users => {
                    users.length.should.be.eql(0);
                    done();
                })
                .catch(done);
        });
    });
});

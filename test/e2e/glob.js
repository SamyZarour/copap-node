// Require the dev-dependencies
const mongoose = require('mongoose'),
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../../bin/www');

// Setting up chai
chai.use(chaiHttp);

// Disabling Mongoose logs
mongoose.set('debug', false);

// Parent Block
describe('Global', () => {
    /*
    * Test 404 route
    */
    describe('When we reach an unrecognized root', () => {
        it('it should return a 404 error', done => {
            chai.request(server)
                .get('/unknown')
                .then(res => {
                    res.should.have.status(404);
                    done();
                })
                .catch(done);
        });
    });
});

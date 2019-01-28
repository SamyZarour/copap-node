const mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    crypto = require('crypto'),
    jwt = require('jsonwebtoken'),
    secret = require('../config').secret;

const UserSchema = new mongoose.Schema({
    username: { type: String, lowercase: true, unique: true, required: [true, 'can not be blank'], match: [/^[a-zA-Z0-9_-]+$/, 'not valid'], index: true },
    email: { type: String, lowercase: true, unique: true, required: [true, 'can not be blank'], match: [/\S+@\S+\.\S+/, 'not valid'], index: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    hash: String,
    salt: String
}, { timestamps: true });

UserSchema.plugin(uniqueValidator, { message: 'is already taken' });

UserSchema.methods.setSalt = function() {
    return crypto.randomBytes(16).toString('hex');
};

UserSchema.methods.encryptPassword = function(password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    return this.hash === this.encryptPassword(password);
};

UserSchema.methods.setPassword = function(password) {
    this.salt = this.setSalt();
    this.hash = this.encryptPassword(password);
};

UserSchema.methods.generateJWT = function() {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        id: this._id,
        email: this.email,
        exp: exp.getTime() / 1000
    }, secret);
};

UserSchema.methods.edit = function(username, email) {
    this.username = username || this.username;
    this.email = email || this.email;
    return this.save();
};

UserSchema.methods.toAuthJSON = function() {
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT()
    };
};

UserSchema.methods.toProfileJSON = function() {
    return {
        username: this.username,
        role: this.role
    };
};

UserSchema.methods.toJSON = function() {
    return {
        username: this.username,
        role: this.role
    };
};

module.exports = mongoose.model('User', UserSchema);

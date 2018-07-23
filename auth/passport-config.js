/***********************
*** Passport ***********
***********************/

const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const User = require('../models/User');

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ Username: username }, function(err, user) {
            if (err) {
            	console.log('Error authenticating when ' + username + ' attempted to log in');
                return done(err);
            }
            if (!user) {
            	console.log('Username "' + username + '" was not found');
                return done(null, false, { message: 'Username or password is incorrect' });
            }
            if (!bcrypt.compareSync(password, user.Password)) {
            	console.log('Incorrect password for ' + username);
                return done(null, false, { message: 'Username or password is incorrect' });
            }
            return done(null, user);
        });
    }
));

module.exports = passport;

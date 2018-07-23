/***********************
*** Routes *************
***********************/

const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const session = require('express-session');
const mongoose = require('mongoose');
const envConfig = require('dotenv').config();
const User = require('../models/User');
const Game = require('../models/Game');
const viewsRouter = require('./views');
const apiRouter = require('./api');

// Mongoose
mongoose.connect(process.env.DB_CONNECTION);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('Connected to MongoDB');
});

// Passport Sessions
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
}));
router.use(passport.initialize());
router.use(passport.session());

// Routes
router.use('/api', apiRouter);
router.use('/', viewsRouter);

module.exports = router;

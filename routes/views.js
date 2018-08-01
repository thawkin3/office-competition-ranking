/***********************
*** Views **************
***********************/

const express = require('express');
const router = express.Router();
const auth = require('../helpers/auth');

router.get('/', auth.ensureNotAuthenticated, (req, res) => {
	res.sendFile('index.html', { root:  'public' });
});

router.get('/login', auth.ensureNotAuthenticated, (req, res) => {
	res.sendFile('index.html', { root:  'public/login' });
});

router.get('/register', auth.ensureNotAuthenticated, (req, res) => {
	res.sendFile('index.html', { root:  'public/register' });
});

router.get('/leaderboard', auth.ensureAuthenticated, (req, res) => {
	res.sendFile('index.html', { root:  'public/leaderboard' });
});

router.get('/recordGame', auth.ensureAuthenticated, (req, res) => {
	res.sendFile('index.html', { root:  'public/recordGame' });
});

router.get('/history/:user', auth.ensureAuthenticated, (req, res) => {
	res.sendFile('index.html', { root:  'public/history' });
});

router.get('/logout', auth.ensureAuthenticated, (req, res) => {
	res.sendFile('index.html', { root:  'public/logout' });
});

module.exports = router;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var envConfig = require('dotenv').config();

var indexRouter = require('./routes/index');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SESSION_SECRET));

app.use('/', indexRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    return res.status(404).type('text').send('Not Found');
});

module.exports = app;

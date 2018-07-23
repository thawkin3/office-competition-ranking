const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const envConfig = require('dotenv').config();

const indexRouter = require('./routes/index');

const app = express();

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

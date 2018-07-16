var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

// var auth = require('./auth');
var indexRouter = require('./routes/index');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);
// app.use(cookieParser(process.env.SESSION_SECRET));
app.use(cookieParser('mysecret'));

// app.use(express.static(path.join(__dirname, 'public', 'javascripts')));
// app.use(express.static(path.join(__dirname, 'public', 'stylesheets')));
app.use('/', indexRouter);
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

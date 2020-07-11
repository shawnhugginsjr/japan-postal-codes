var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var sqlite3 = require('sqlite3');
var sqlite = require('sqlite');

var indexRouter = require('./routes/index');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

sqlite.open({
  filename: path.join(__dirname, 'postal_codes.db'),
  driver: sqlite3.Database
}).then((db) => {
  app.use(function (req, res, next) {
    req.db = db;
    next();
  });
  app.use('/', indexRouter);
  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });
  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
}).catch((err) => {
  console.log(err)
  process.exit(1)
})

module.exports = app;

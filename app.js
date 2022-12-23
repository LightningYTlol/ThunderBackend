const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const msauth = require('./routes/v1/msauth');
const app = express();
const ErrorHandler = require('./middleware/errorhandler')

process.on('uncaughtException', (error) => console.log(error));
process.on('unhandledRejection', (error) => console.log(error));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/v1/msauth/:username/:password/:options?', msauth);
// catch 404 and forward to error handler


// error handler
app.use(ErrorHandler);

module.exports = app;

app.listen(3000, () => {
  console.log(`Now listening on port 3000`);
})

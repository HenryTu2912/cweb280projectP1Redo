var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var devRouter = require('./routes/devLogin');
//add a new const for the examples.js router
const examplesRouter = require('./routes/examples')

var app = express();
app.use(cookieParser())
//------------Passport local-------------------
const passport = require('passport')
const session = require('express-session')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
)

const users = [{id: '1', username: 'henry', password: '12345'}]

app.use(session({
  secret: 'shhhhhhh_this-is+SECret', 
  resave: false,
  saveUninitialized: false
}))


app.use(passport.initialize())
app.use(passport.session())

//-------------------------------------------------





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', devRouter);
app.use('/bw', express.static(__dirname + '/node_modules/bootswatch/dist'))
// add a new path called examples that uses the code in the examples.js file for routing
app.use('/examples', examplesRouter)


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

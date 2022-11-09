var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session')
const Sqlite = require('better-sqlite3'); // sqlite database driver
const SqliteStore = require('better-sqlite3-session-store')(session);
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var devRouter = require('./routes/devLogin');
//add a new const for the examples.js router
const examplesRouter = require('./routes/examples')
const Handlebars = require("handlebars");
Handlebars.registerHelper('cutJWT', function(ses){
  var sb = ses.slice(0, 20);
  console.log(sb)
  return sb;
})
var app = express();

app.use(cookieParser())
const passport = require('passport')
//------------Google Passport local-------------------
var GoogleStrategy = require('passport-google-oidc').Strategy;

const GGUser = []

passport.use(new GoogleStrategy({
  clientID: '478420348143-m90s5qe3fn0sj3dijs7migom5g38v7b9.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:3000/login/google/callback',
  passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done){
  return done(null, profile)
}))


//------------Passport local-------------------

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    username => users.find(user => user.username === username)
)

const users = [{username: 'henry', password: '12345'}]

app.use(session({
  secret: 'shhhhhhh_this-is+SECret', 
  resave: false,
  saveUninitialized: false,
  store: new SqliteStore({ // a location to store session besides the memory
    client: new Sqlite('sessions.db', {verbose: console.log}),
    expired: {clear: true, intervalMs: 1000*60*15},
  }),  
}))


app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => {
    return done(null, user)
})

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

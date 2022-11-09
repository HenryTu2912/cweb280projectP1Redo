const { authenticate } = require('passport')
// const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy
var GoogleStrategy = require('passport-google-oidc').Strategy;

function initialize(passport, getUserByName) {
    const authenticateUser =  (username, password, done) => {
        const user = getUserByName(username)
        if(user == null) {
            return done(null, false, {message: 'No user with that email'})
        }
        try{
            if(user.password === password) {
                return done(null, user)
            }else {
                return done(null, false, {message: 'Password incorrect'})
            }
        }catch(e){
            return done(e)
        }
    }
    passport.use(new GoogleStrategy({
        clientID: '478420348143-ipf9plfjcg27qm4h30a7cg6nuu2brrgn.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'http://localhost:3000/messages'
    }, function (request, accessToken, refreshToken, profile, done){
        return done(null, profile)
    }))
    passport.use(new LocalStrategy({usernameField: 'username'}, authenticateUser))
    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((user, done) => {
        return done(null, user)
    })

}

module.exports = initialize
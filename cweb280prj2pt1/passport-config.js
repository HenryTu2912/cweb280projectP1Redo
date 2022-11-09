const { json } = require('express');
const { authenticate } = require('passport')
// const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy
// var GoogleStrategy = require('passport-google-oidc').Strategy;

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
    // passport.use(new GoogleStrategy({
    //     clientID: '478420348143-m90s5qe3fn0sj3dijs7migom5g38v7b9.apps.googleusercontent.com',
    //     clientSecret: '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',
    //     callbackURL: 'http://localhost:3000/login/messages'
    // }, function (request, accessToken, refreshToken, profile, done){
    //     console.log('=============GOOGLE PASSPORT=================')
    //     console.log(accessToken)
    //     return done(null, profile)
    // }))
    passport.use(new LocalStrategy({usernameField: 'username'}, authenticateUser))
    // passport.serializeUser((user, done) => done(null, user))
    // passport.deserializeUser((user, done) => {
    //     return done(null, user)
    // })

}

module.exports = initialize
const express = require('express')
const router = express.Router()
const passport = require('passport')
var fs = require('fs');

router.get('/', checkNotAuthenticated, (req, res, next)=>{
    var user = req.cookies.username
    console.log(user)
    res.render('login', {
        cookieUsername: user.username,
        cookiePassword: user.password
    })
})

router.post('/', checkNotAuthenticated, passport.authenticate('local',  {
    //successRedirect: '/login/welcome',
    failureRedirect: '/login',
}), (req, res, next)=>{
    const cookieOptions ={
        path: req.baseUrl,
        sameSite: 'lax',
        httpOnly: true,
        maxAge: 30*24*60*60*1000,
    }
    var user = {
        username: req.body.username,
        password: req.body.password
    }
    console.log(user);
    res.cookie('username', user, cookieOptions)
    res.redirect('/login/welcome')
})

router.get('/welcome', checkAuthenticated, (req, res, next)=>{
    console.log(req.cookies)
    console.log(req.cookies.val)
    res.render('welcome', {
        Title: 'KEY PAGE',
        publickey: fs.readFileSync('es256public.pem'),
        privatekey:fs.readFileSync('es256private.key')
    })
})

router.post('/welcome', checkAuthenticated, (req, res)=>{
    var newPublic = req.body.public;
    var newPrivate = req.body.private;
    console.log(newPublic);
    console.log(newPrivate);
    fs.writeFileSync('es256public.pem', newPublic)
    fs.writeFileSync('es256private.key', newPrivate)
    res.render('welcome', {
        Title: 'SUCCESSFULLY UPDATE KEY',
        publickey: 'Updated new public key',
        privatekey: 'Updated new private key'
    })
})

router.get('/auth/google', passport.authenticate('google', {scope: ['email', 'profile']}))

router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/messages',
    failureRedirect: '/login'
}))

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}
module.exports = router
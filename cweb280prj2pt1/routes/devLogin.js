const express = require('express')
const router = express.Router()
const passport = require('passport')
var fs = require('fs');

router.get('/', checkNotAuthenticated, (req, res, next)=>{
    res.render('login')
})

router.post('/', checkNotAuthenticated, passport.authenticate('local',  {
    //successRedirect: '/login/welcome',
    failureRedirect: '/login',
}), (req, res, next)=>{
    res.redirect('/login/welcome')
})

router.get('/welcome', checkAuthenticated, (req, res, next)=>{
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
    })
})

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
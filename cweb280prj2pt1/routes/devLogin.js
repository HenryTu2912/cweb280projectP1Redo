const express = require('express')
const router = express.Router()
const passport = require('passport')
var fs = require('fs');
const Handlebars = require("handlebars");
//--------JWT--------------
const jwt = require('jsonwebtoken')
let jwtArray = []

const determineAccess = (req)=> {
    const payload = {message: null, sender: null, receiver: null, expiredDate: null};
    payload.message = req.body.message;
    payload.sender = "sender";
    payload.receiver = req.body.email;
    var date1 = new Date();
    var date2 = new Date(req.body.exDate);
    var dateDiff = Math.ceil((date2.getTime() - date1.getTime())/ (1000 * 3600 * 24));
    console.log(dateDiff);
    payload.expiredDate = dateDiff+'d';
    return payload;
  };

  const encodeJWT = (payload)=>{
    // get a private key stored in a file
    const privateKey = fs.readFileSync('es256private.key'); // gets file buffer with binary file content
  
    // use private key to encrypt the token with ES256 encoding scheme
    const token = jwt.sign(payload, privateKey, {algorithm: 'ES256', expiresIn: payload.expiredDate,
    } );
    return token;
  };

  const checkJWT = (token, scope)=>{
    let decoded;
    try {
  
      // get a public key stored in a file
      const cert = fs.readFileSync('es256public.pem'); // get file buffer of binary file data
      // use public key to decrypt the token with ES256 scheme
      decoded = jwt.verify(token, cert, {algorithm: 'ES256',
      } );
  
      // check that the scope in the token matches the scope passed in as a param
    //   if (!decoded.role || decoded.role != 'admin') { // this allows admin user to go to any page
    //     if (!decoded.scope || decoded.scope != scope) throw new Error('scope is not permitted');
    //   }
    } catch (err) {
      console.log(`JWT Error:\n ${err}`);
      // redirect back to login page and specify the error message in the query string
      decoded = {redirectURL: '/secure/?err=' + err.message};
    }
    return decoded;
  };


//-------------------------


//==================LOG IN PAGE==========================
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

//==================WELCOME PAGE==========================
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

//==================GOOGLE LOG IN==========================
router.get('/auth/google', checkNotAuthenticated, passport.authenticate('google', {scope: ['email', 'profile']}))

router.get('/auth/google/callback', checkNotAuthenticated, passport.authenticate('google', {
    successRedirect: '/login/messages',
    failureRedirect: '/login'
}))


//==================MESSAGES PAGE==========================
router.get('/messages', checkNotAuthenticated, (req, res, next)=>{
    res.render('messages',{
        title: 'Messages'
    })
})



router.post('/messages', (req, res, next)=>{
    const payload = determineAccess(req);
    // set some standard cookie options
    const cookieOptions = {
        path: req.baseUrl,
        sameSite: 'lax',
        httpOnly: req.body.hide && req.body.hide ==='yes', // setting httpOnly to true hides the cookie from Javascript in the browser
    };
    //res.cookie('JWT', payload, cookieOptions);
    jwtArray.push(encodeJWT(payload))
    var sess = req.session;
    sess.email = req.body.email;
    sess.jwt = jwtArray;
    console.log('Print session: ')
    console.log(req.session)

    var listSession = req.session.jwt;
    var jwtCut = []
    console.log(listSession)
    listSession.forEach(element => {
        jwtCut.push(element.slice(0, 20))
    });
    console.log("=========================")
    console.log(jwtCut)
    //res.redirect('/secure/secretMessage/?access_token=' + encodeJWT(payload));
    res.render('messages',{
        title: 'Messages',
        sessionID: req.sessionID,
        activeSession: JSON.stringify(req.session, null, 4),
        listSession: listSession,        
    })
})

//==================AUTHENTICATE METHODS==========================
function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    else{
        res.redirect('/login')
    }    
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return redirect('/login')
    }
    next()
}
module.exports = router
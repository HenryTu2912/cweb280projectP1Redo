/**
 * examples.js
 * router for path: http://localhost:3000/examples/
 */

 const express = require('express')
 const router = express.Router()
 
 //TODO: code to handle GET request to the /examples/ path
 /* GET content for path: http://localhost:3000/examples/ */
 router.get('/', function (req, res, next) {
   // send content directly to the browser (not using a template) - this can be tedious
   res.send('<html><head><title>Examples Index</title> <link rel="stylesheet" href="/bw/quartz/bootstrap.css" /></head>' +
       '<body class="container"><h1>Examples</h1><ul>' +
  '<li><a href="/examples/simple-code/">Simple Server Code examples</a></li>' +
       '</ul></body>')
 })
 module.exports = router
 
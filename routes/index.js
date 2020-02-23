var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  console.log('Cookies: ', req.cookies);
  if(typeof req.cookies.token !=='undefined'){
    res.render('index', {logged: true});
  }
  else {
    res.render('index', {logged: false});
  }
});

module.exports = router;

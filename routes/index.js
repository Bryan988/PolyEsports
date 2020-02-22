var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('Cookies: ', req.cookies);
  if(typeof req.cookies.token !=='undefined'){
    res.render('index', {title: 'Logged', logged: true});
  }
  else {
    res.render('index', {title: 'Express', logged: false});
  }
});
router.get('/template',(req,res)=>{
  res.render('template');
})

module.exports = router;

var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');
let key = require('../config/key');
let secretkey = key.secretkey;


/* GET home page. */
router.get('/', function(req, res) {
  console.log(__dirname);
  console.log(req.cookies.token);
  jwt.verify(req.cookies.token, secretkey, (err, playload) => {
    if (err) {
      console.log(err.message);
      return res.render('index', {logged: false});
    } else {
      return res.render('index', {logged: true});
    }
  });
});

module.exports = router;

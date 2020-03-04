var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');
let key = require('../config/key');
let services = require("../services/commonServices");
let secretkey = key.secretkey;


/* GET home page. */
router.get('/', function(req, res) {
  console.log(__dirname);
  console.log(req.cookies.token);
  let signedup = req.cookies.signedup;
  jwt.verify(req.cookies.token, secretkey, (err, playload) => {

    if (err) {console.log(err.message);}
    if(typeof playload !=='undefined'){
      let isAdmin = playload.isAdmin;
      res.render('index', {idUser:playload.id,logged: true,isAdmin,signedup});
    }
    else{res.render('index', {logged: false,isAdmin : false,signedup});}

  });
});

module.exports = router;

var express = require('express');
var router = express.Router();
var users = require('../controllers/usersController');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/login',users.loginpage);
router.post('/login',users.login);

router.get('/signup',users.signupPage);
router.post('/signup',users.signup);

router.get('/admin',users.verifyAdmin,users.adminPage);

module.exports = router;

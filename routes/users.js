var express = require('express');
var router = express.Router();
var users = require('../controllers/usersController');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/login',users.checkLogged,users.loginpage);
router.post('/login',users.checkLogged,users.login);

router.get('/signup',users.checkLogged,users.signupPage);
router.post('/signup',users.checkLogged,users.signup);

router.get('/admin',users.verifyAdmin,users.adminPage);

router.get('/logout',users.logout);

module.exports = router;

const express = require('express');
const router = express.Router();
const users = require('../controllers/usersController');
const services = require('../services');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/login',services.checkLogged,users.loginpage);
router.post('/login',services.checkLogged,users.login);

router.get('/signup',services.checkLogged,users.signupPage);
router.post('/signup',services.checkLogged,users.signup);

router.get('/logout',services.logout);

module.exports = router;

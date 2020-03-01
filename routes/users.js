const express = require('express');
const router = express.Router();
const users = require('../controllers/usersController');
const middleware = require('../middlewares/userMW');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login',middleware.checkNonLogged,users.loginpage);
router.post('/login',middleware.checkNonLogged,users.login);

router.get('/signup',middleware.checkNonLogged,users.signupPage);
router.post('/signup',middleware.checkNonLogged,users.signup);

router.get('/logout',middleware.logout);

module.exports = router;

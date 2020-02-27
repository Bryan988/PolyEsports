const express = require('express');
const router = express.Router();
const users = require('../controllers/usersController');
const middleware = require('../middlewares/userMW');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/login',middleware.checkLogged,users.loginpage);
router.post('/login',middleware.checkLogged,users.login);

router.get('/signup',middleware.checkLogged,users.signupPage);
router.post('/signup',middleware.checkLogged,users.signup);

router.get('/logout',middleware.logout);

module.exports = router;

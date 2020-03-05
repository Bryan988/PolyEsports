const express = require('express');
const router = express.Router();
const users = require('../controllers/usersController');
const middleware = require('../middlewares/userMW');
const bouncer = require('express-bouncer')(500,900000,5)


/* GET users listing. */
router.get('/profile/:id',middleware.checkLogged,users.profilePage);
router.put('/profile/:id',middleware.checkLogged,users.updateProfile);

router.get('/profile/:id/password',middleware.checkLogged,users.updatePwPage);
router.put('/profile/:id/password',middleware.checkLogged,users.updatePw);


router.get('/login',bouncer.block,middleware.checkNonLogged,users.loginpage);
router.post('/login',middleware.checkNonLogged,users.login);

router.get('/lost-password',middleware.checkNonLogged,users.lostPwPage);
router.put('/lost-password',middleware.checkNonLogged,users.lostPw);

router.get('/lost-password/:key',middleware.checkNonLogged,users.lostPwKeyPage);
router.put('/lost-password/:key',middleware.checkNonLogged,users.lostPwKey);


router.get('/signup',middleware.checkNonLogged,users.signupPage);
router.post('/signup',middleware.checkNonLogged,users.signup);

router.get('/logout',middleware.logout);

module.exports = router;
